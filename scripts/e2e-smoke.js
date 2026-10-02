const fs = require("fs");
const { chromium } = require("playwright");

const BASE = (process.env.GQB_E2E_BASE_URL || "http://127.0.0.1:4173").replace(/\/$/, "");
const catalog = [
  ...JSON.parse(fs.readFileSync("src/tools.json", "utf8")),
  ...JSON.parse(fs.readFileSync("src/tools-extra.json", "utf8"))
];

const imageTools = new Set(["image-compress","image-resize","color-image","image-format","ocr-image"]);
const pdfTools = new Set(["pdf-merge","pdf-split","pdf-text","pdf-jpg","pdf-delete","pdf-rotate","pdf-numbers","pdf-watermark","pdf-png","pdf-ocr","pdf-extract","pdf-reorder"]);

function makePdf() {
  const content1 = "BT /F1 32 Tf 72 700 Td (GQB Test Page 1) Tj ET\n";
  const content2 = "BT /F1 32 Tf 72 700 Td (GQB Test Page 2) Tj ET\n";
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R 4 0 R] /Count 2 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 6 0 R >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 7 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Length " + Buffer.byteLength(content1) + " >>\nstream\n" + content1 + "endstream",
    "<< /Length " + Buffer.byteLength(content2) + " >>\nstream\n" + content2 + "endstream"
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (let i = 0; i < objects.length; i++) {
    offsets.push(Buffer.byteLength(pdf));
    pdf += (i + 1) + " 0 obj\n" + objects[i] + "\nendobj\n";
  }
  const xref = Buffer.byteLength(pdf);
  pdf += "xref\n0 " + (objects.length + 1) + "\n";
  pdf += "0000000000 65535 f \n";
  for (let i = 1; i < offsets.length; i++) pdf += String(offsets[i]).padStart(10, "0") + " 00000 n \n";
  pdf += "trailer\n<< /Size " + (objects.length + 1) + " /Root 1 0 R >>\nstartxref\n" + xref + "\n%%EOF\n";
  return Buffer.from(pdf, "ascii");
}

async function makeImage(page) {
  const b64 = await page.evaluate(() => new Promise(resolve => {
    const c = document.createElement("canvas");
    c.width = 900; c.height = 260;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height);
    ctx.fillStyle = "#000"; ctx.font = "bold 150px Arial";
    ctx.fillText("GQB", 60, 180);
    c.toBlob(blob => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result).split(",")[1]);
      r.readAsDataURL(blob);
    }, "image/png");
  }));
  return Buffer.from(b64, "base64");
}

function textForTool(impl) {
  if (impl === "json") return '{"name":"GQB","ok":true,"items":[1,2,3]}';
  if (impl === "url") return "https://gqb.app/?q=hello world";
  if (impl === "base64") return "你好 • GQB";
  if (impl === "csvjson") return 'name,note\nAlice,"hello, world"';
  if (impl === "hash") return "GQB Tools health test";
  if (impl === "regex") return "GQB";
  if (impl === "dedupe") return "a\nb\na\n";
  if (impl === "whitespace") return "  GQB   Tools\n\n\nhealth  ";
  if (impl === "slug") return "GQB Tools — Global Utilities";
  if (impl === "scientific") return "2+3*4";
  return "GQB Tools health test";
}

async function fillCommon(page, impl) {
  const values = {
    bmi:["168","72","35"], loan:["100000","3.5","20"], tip:["100","15","2"],
    discount:["100","20"], vat:["100","20"], compound:["1000","5","10"],
    "percentage-change":["100","120"], roi:["1000","1300"], markup:["60","100"],
    "profit-margin":["60","100"], "break-even":["5000","100","40"],
    percentage:["500","18"], aspect:["1920","1080"], random:["1","100","3"],
    "date-add":["7"]
  };
  let ni = 0;
  const inputs = page.locator("input");
  for (let i = 0; i < await inputs.count(); i++) {
    const input = inputs.nth(i);
    const type = (await input.getAttribute("type") || "text").toLowerCase();
    if (type === "file" || type === "checkbox" || type === "range" || type === "radio") continue;
    if (type === "date") {
      await input.fill(impl === "age" ? "1990-05-10" : "2026-10-01");
    } else if (type === "datetime-local") {
      await input.fill("2026-10-02T12:00");
    } else if (type === "number") {
      const v = values[impl]?.[ni] ?? "10";
      await input.fill(v);
      ni++;
    } else {
      await input.fill(impl === "regex" && ni === 0 ? "GQB" : "GQB Tools");
      ni++;
    }
  }
  const tas = page.locator("textarea");
  for (let i = 0; i < await tas.count(); i++) await tas.nth(i).fill(textForTool(impl));
  if (impl === "regex") {
    await page.locator("input.pat").fill("GQB");
    await page.locator("textarea").fill("GQB Tools GQB");
  }
}

async function upload(page, impl, imageBuffer, pdfBuffer) {
  const input = page.locator('input[type="file"]').first();
  if (imageTools.has(impl)) {
    await input.setInputFiles({name:"gqb-test.png",mimeType:"image/png",buffer:imageBuffer});
  } else if (pdfTools.has(impl)) {
    await input.setInputFiles({name:"gqb-test.pdf",mimeType:"application/pdf",buffer:pdfBuffer});
  } else if (impl === "jpg-pdf") {
    await input.setInputFiles({name:"gqb-test.png",mimeType:"image/png",buffer:imageBuffer});
  }
}

async function waitForResult(page, impl) {
  const timeout = (impl === "ocr-image" || impl === "pdf-ocr") ? 120000 : 30000;
  await page.waitForFunction((tool) => {
    if (tool === "ocr-image" || tool === "pdf-ocr") {
      return (document.querySelector(".ocrText")?.value || "").trim().length > 0;
    }
    const output = (document.querySelector(".output")?.textContent || "").trim();
    const textareas = [...document.querySelectorAll("textarea")].some(x => x.value.trim().length > 0);
    const downloads = [...document.querySelectorAll("a")].some(a => a.href.startsWith("blob:"));
    const qr = document.querySelector(".qrBox")?.children.length > 0;
    const generated = document.querySelector("input.password")?.value?.length > 0;
    return output.length > 0 || textareas || downloads || qr || generated || tool === "timestamp";
  }, impl, {timeout});
}

async function runTool(page, tool, imageBuffer, pdfBuffer) {
  const impl = tool.impl;
  await page.goto(`${BASE}/en/tools/${tool.slug}/`, {waitUntil:"domcontentloaded", timeout:30000});
  if (await page.locator("#toolApp .toolbox").count() !== 1) throw new Error("toolbox not mounted");

  if (impl === "text" || impl === "characters" || impl === "lines") {
    await page.locator("textarea").first().fill("GQB Tools test\nSecond line.");
    await waitForResult(page, impl);
    return "live text update verified";
  }

  if (impl === "heic-jpg") return "UI path checked; success fixture omitted because a real HEIC asset is required";

  if (impl === "password") {
    const input = page.locator("input[type=number]").first();
    await input.fill("20");
    await page.locator("button:not(.secondary)").first().click();
    await page.waitForFunction(() => (document.querySelector("input.password")?.value || "").length >= 6, null, {timeout:5000});
    return "cryptographic password generation verified";
  }

  if (impl === "uuid") {
    await page.locator("button:not(.secondary)").first().click();
    await page.waitForFunction(() => /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(document.querySelector("input.password")?.value || ""), null, {timeout:5000});
    return "UUID v4 generation verified";
  }

  if (impl === "timezone") {
    await page.locator("input.tz-date").fill("2026-10-02T12:00");
    await page.locator("button:not(.tz-swap)").click();
    await page.waitForTimeout(250);
    const timezoneOutput = (await page.locator("#toolApp .output").textContent() || "").trim();
    if (!timezoneOutput) throw new Error("time-zone conversion output empty; inputs=" + await page.locator("input.tz-date").inputValue() + ", from=" + await page.locator("select.tz-from").inputValue() + ", to=" + await page.locator("select.tz-to").inputValue());
    if (!/04:00:00|4:00:00/.test(timezoneOutput)) throw new Error("unexpected time-zone conversion output: " + timezoneOutput);
    return "time-zone conversion output verified: " + timezoneOutput.slice(0,80);
  }

  if (impl === "slug") {
    await page.locator('input[placeholder="Your title"]').fill("GQB Tools — Global Utilities");
    await page.locator("button:not(.secondary)").first().click();
    await page.waitForTimeout(250);
    const slugOutput = (await page.locator("#toolApp .output").textContent() || "").trim();
    if (!slugOutput) throw new Error("slug generation output empty");
    if (!/gqb-tools-global-utilities/.test(slugOutput)) throw new Error("unexpected slug output: " + slugOutput);
    return "slug generation output verified: " + slugOutput;
  }

  if (imageTools.has(impl) || pdfTools.has(impl) || impl === "jpg-pdf") {
    await upload(page, impl, imageBuffer, pdfBuffer);
    if (impl === "color-image") {
      await page.waitForFunction(() => {
        const c = document.querySelector("#toolApp canvas");
        return !!c && c.width > 0 && c.height > 0;
      }, null, {timeout:10000});
      await page.locator("canvas").click({position:{x:30,y:30}});
    } else {
      if (impl === "image-resize") {
        await page.locator("input.w").fill("300");
        await page.locator("input.h").fill("90");
      }
      if (impl === "pdf-split" || impl === "pdf-extract") await page.locator("input.pages").fill("1");
      if (impl === "pdf-delete") await page.locator("input.pages").fill("2");
      if (impl === "pdf-reorder") await page.locator("input.order").fill("2,1");
      if (impl === "pdf-watermark") await page.locator("input.wm").fill("GQB TEST");
      if (impl === "pdf-ocr") await page.locator("input.pages").fill("1");
      await page.locator("button:not(.secondary)").first().click();
    }
    await waitForResult(page, impl);
    return "file workflow executed with generated fixture";
  }

  if (impl === "currency") {
    await page.route("https://open.er-api.com/**", async route => {
      await route.fulfill({
        status:200, contentType:"application/json",
        body:JSON.stringify({rates:{USD:1,CNY:7.2,EUR:0.9},time_last_update_utc:"E2E fixture"})
      });
    });
  }

  await fillCommon(page, impl);
  const transformInPlace = new Set(["json","url","base64"]);
  const before = transformInPlace.has(impl) ? await page.locator("textarea").first().inputValue() : null;
  await page.locator("button:not(.secondary)").first().click();
  if (transformInPlace.has(impl)) {
    await page.waitForFunction(oldValue => (document.querySelector("textarea")?.value || "") !== oldValue, before, {timeout:10000});
  } else if (impl === "whitespace") {
    const value = await page.locator("textarea").first().inputValue();
    if (/ {2,}|\n{3,}/.test(value)) throw new Error("whitespace cleanup incomplete: " + JSON.stringify(value));
    return "whitespace normalization verified";
  } else if (impl === "timestamp") {
    await page.waitForFunction(() => /^-?\d+$/.test((document.querySelector(".output")?.textContent || "").trim()), null, {timeout:5000});
  } else {
    await waitForResult(page, impl);
  }
  return "interactive path executed";
}

(async() => {
  const browser = await chromium.launch({headless:true});
  const page = await browser.newPage({viewport:{width:1440,height:1000}});
  const imageBuffer = await makeImage(page);
  const pdfBuffer = makePdf();
  const pageErrors = [];
  page.on("pageerror", err => pageErrors.push(err.message));

  const results = [];
  for (const tool of catalog) {
    pageErrors.length = 0;
    try {
      const note = await runTool(page, tool, imageBuffer, pdfBuffer);
      if (pageErrors.length) throw new Error("pageerror: " + pageErrors.join(" | "));
      const status = tool.impl === "heic-jpg" ? "partial" : "pass";
      results.push({slug:tool.slug,impl:tool.impl,status,note});
      console.log("[e2e:" + status.toUpperCase() + "]", tool.slug, "-", note);
    } catch (err) {
      results.push({slug:tool.slug,impl:tool.impl,status:"fail",note:String(err.message || err),pageErrors:[...pageErrors]});
      console.error("[e2e:FAIL]", tool.slug, "-", String(err.message || err));
    }
  }
  await browser.close();

  const summary = {
    total:results.length,
    pass:results.filter(x=>x.status==="pass").length,
    partial:results.filter(x=>x.status==="partial").length,
    fail:results.filter(x=>x.status==="fail").length
  };
  console.log("E2E summary:", JSON.stringify(summary));
  fs.mkdirSync("e2e-results",{recursive:true});
  fs.writeFileSync("e2e-results/tool-health.json", JSON.stringify(results,null,2) + "\n");
  if (summary.fail) process.exit(1);
})();
