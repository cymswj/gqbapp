# GQB Tools 产品级工具审计

本审计不是单纯检查“按钮能不能点”，而是检查每个工具是否完成四层任务：
1. 算得对 / 转得对 / 文件处理得对
2. 普通人看得懂结果
3. 用户知道结果的边界、假设和下一步
4. 用户知道数据是否会离开设备

## 核心产品原则：Explainable Utility

工具站不能停在“输入 → 数字”。理想结果结构是：

结果 → 这是什么意思 → 依据什么标准 → 需要注意什么 → 下一步看什么

健康类和金融类尤其不能只输出单个数字；文件工具则不能只给一个下载链接。

## 63 个工具逐项审计

### Calculators

| 工具 | 当前主要问题 | 下一步产品化方向 |
|---|---|---|
| Percentage Calculator | 结果缺少语义 | 显示百分比结果、公式、例子，并区分求某数的百分比与百分比变化 |
| Age Calculator | 只给整年 | 增加岁、月、日，下一个生日等信息 |
| Date Difference Calculator | 只给绝对天数 | 增加自然月/自然年、是否包含首尾日期、正负方向 |
| Scientific Calculator | 原实现存在动态代码执行风险 | 使用安全表达式解析器，明确支持的函数与运算 |
| Aspect Ratio Calculator | 只给比例 | 增加常见比例识别、保持比例时的另一边尺寸 |
| Date Add / Subtract | 只有天数 | 增加天/周/月/年，并明确月底行为 |
| Business Days Calculator | 只按周一至周五 | 明确不含法定节假日，后续增加国家/地区假日表 |
| Percentage Change Calculator | 只给百分比 | 同时显示变化量、方向、公式 |
| BMI Calculator | 原来只有单个 BMI 数字，普通用户难以解释 | 已升级为成人分类、参考标准、参考体重范围、腰围身高比、限制和下一步 |
| Time Zone Converter | 原实现对源时区语义处理不正确 | 已改为源时区到目标时区的实际转换，并增加交换与 UTC 对照 |

### Converters

| 工具 | 当前主要问题 | 下一步产品化方向 |
|---|---|---|
| Currency Converter | 外部汇率源，时间语境不足 | 显示来源、更新时间、汇率日期、反向汇率、刷新状态 |
| Unit Converter | 旧实现把长度与重量放在同一单位池，存在跨维度误用 | 已改成维度选择并限制兼容单位 |
| Data Unit Converter | 1000 与 1024 容易混淆 | 明确 decimal kB/MB 与 binary KiB/MiB |
| Speed Converter | 单位覆盖有限 | 增加常见单位并显示定义 |
| Area Converter | 单位覆盖有限 | 增加 acre/hectare/square feet 等 |
| Volume Converter | 容量单位有地区差异 | 区分 US gallon / Imperial gallon |
| Temperature Converter | 只有结果 | 显示转换公式与边界说明 |
| Weight Converter | 单位说明不足 | 增加更多常用质量单位并明确体系 |
| Time Zone Converter | 见上 | 增加 DST 边界测试和异常时间提示 |

### Finance

| 工具 | 当前主要问题 | 下一步产品化方向 |
|---|---|---|
| Loan Payment Calculator | 缺少计算假设 | 显示固定利率、支付次数、手续费/保险/税费是否包含 |
| Tip Calculator | 缺少输入校验和拆分语义 | 同时显示小费金额、含小费总额、每人金额 |
| Discount Calculator | 只有折后价 | 同时显示节省金额、折后价和折扣比例 |
| VAT Calculator | 未区分含税与未税 | 增加双向计算、税额和税率说明 |
| Compound Interest Calculator | 复利模型较简单 | 增加复利频率、定期追加和增长曲线 |
| Profit Margin Calculator | Margin 与 Markup 容易混淆 | 同时显示利润额、毛利率和加价率 |
| ROI Calculator | 单一百分比缺少时间语境 | 显示净回报和投入成本，并说明未考虑时间价值 |
| Markup Calculator | 只有百分比 | 同时显示成本、售价、利润和 margin 对照 |
| Break-Even Calculator | 只输出单位数 | 显示贡献利润和保本收入，并提示售价必须高于单位可变成本 |

### PDF

| 工具 | 当前主要问题 | 下一步产品化方向 |
|---|---|---|
| JPG to PDF | 缺少图片预览和输出信息 | 批量缩略图、排序、页面尺寸、方向、输出大小 |
| PDF Merger | 缺少文件顺序反馈 | 拖拽排序、页数、大小、失败文件提示 |
| PDF Splitter | 依赖手输页码 | 页缩略图选择、范围说明和校验 |
| PDF to Text | 只有提取文本 | 显示页数、状态、复制/下载 TXT |
| PDF to JPG | 输出体验较基础 | 页面预览、DPI、质量、批量 ZIP |
| Delete PDF Pages | 依赖页码输入 | 可视化选页、删除前后页数 |
| Rotate PDF | 只有角度 | 页码选择、单页/全部页、预览 |
| Add PDF Page Numbers | 缺少位置和格式 | 位置、起始数字、字号、首页跳过 |
| Add PDF Watermark | 功能较基础 | 透明度、位置、字号、角度、指定页 |
| PDF to PNG | 输出体验较基础 | DPI、背景说明、批量下载 |
| PDF OCR | 进度和限制需要更明显 | 页数、语言、进度、单页失败、TXT 下载、隐私说明 |
| Extract PDF Pages | 页码输入不直观 | 缩略图选页、保留顺序、范围验证 |
| Reorder PDF Pages | 依赖输入字符串 | 缩略图拖拽、移动/删除/复制页面 |

### Image

| 工具 | 当前主要问题 | 下一步产品化方向 |
|---|---|---|
| Image Compressor | 当前统一输出 JPEG，可能损失透明背景 | PNG/WebP/JPEG、原始/输出大小、压缩率、预览 |
| Image Resizer | 宽高可独立输入导致变形 | 锁定比例、按宽/高/百分比缩放 |
| Color Picker from Image | 基础功能 | HEX/RGB/HSL、放大取色、复制 |
| Image Format Converter | 基础转换 | 批量、透明背景说明、质量、输出大小 |
| HEIC to JPG | 单文件为主 | 批量、进度、预览、原始/结果尺寸 |
| Image to Text OCR | OCR 信息不足 | 多语言、进度、复制、下载、失败提示 |

### Text

| 工具 | 当前主要问题 | 下一步产品化方向 |
|---|---|---|
| Word Counter | CJK 中 word 的概念不直观 | 单词、字符、CJK、句子、段落、阅读时间分开展示 |
| Character Counter | 统计维度少 | Unicode 字符、字节数、空格/换行 |
| Line Counter | 功能过于简单 | 空行、非空行、最长行、换行符类型 |
| Duplicate Line Remover | 基础可用 | 首次/最后一次、大小写敏感、去空格比较 |
| Whitespace Cleaner | 操作定义不够清楚 | 行首/行尾、连续空格、空行、全角空格分别处理 |

### Developer

| 工具 | 当前主要问题 | 下一步产品化方向 |
|---|---|---|
| JSON Formatter | 错误信息太简单 | 错误位置、行列、复制、压缩 |
| URL Encoder & Decoder | encodeURI 与 encodeURIComponent 易混淆 | 模式选择、例子、结果对照 |
| Unix Timestamp | 功能较基础 | 秒/毫秒、ISO 8601、UTC/本地双向转换 |
| UUID Generator | 缺少版本和批量 | UUID v4、批量、复制/下载 |
| Base64 Encoder & Decoder | Unicode 与文件模式不够清楚 | 明确 UTF-8，增加文件模式 |
| Hash Generator | 缺少算法解释 | SHA-256/384/512、摘要长度、本地计算说明 |
| Regex Tester | 只有测试结果 | 匹配高亮、数量、捕获组、错误位置 |
| URL Slug Generator | 规则较简单 | Unicode、空格、分隔符和重复词规则 |
| CSV to JSON Converter | split(',') 无法完整处理标准 CSV 引号 | 引号/逗号/换行处理、错误行定位 |

### Generators

| 工具 | 当前主要问题 | 下一步产品化方向 |
|---|---|---|
| Password Generator | 只有生成，没有强度说明 | 系统安全随机数、长度/字符集、熵估算、复制 |
| Random Number Generator | 只有随机数 | 整数/小数、唯一值、批量导出、随机性说明 |
| QR Code Generator | 功能较基础 | PNG/SVG、纠错级别、尺寸、边距 |

## 全站统一升级规则

### 1. 任何数字都必须可解释

不能只出现 BMI 25.5。

应该出现：
结果：BMI 25.5
按当前参考标准：处于超重参考范围。
这意味着什么：这个数值说明身高与体重的相对关系，但不能单独判断一个人是否健康。
接下来关注什么：腰围、血压、血糖、血脂、日常活动量和体重趋势。

其他计算器也遵循同一逻辑：
- Percentage：这个百分比说明什么
- Loan：月供由哪些假设计算出来
- ROI：ROI 没有告诉你的东西是什么
- Date Difference：是否包含首尾日期
- Business Days：是否包含节假日
- Currency：汇率什么时候更新、来自哪里
- Data Unit：1000 和 1024 分别代表什么
- PDF：文件是否离开设备
- OCR：文件是否上传到服务器

### 2. 任何转换都必须防止错误维度

用户不应该有机会把 5 kg 转成 m 这种明显错误的输入交给工具。

### 3. 任何外部服务都必须告诉用户

页面应该明确区分 Local / Browser 与 External service。
前者说明输入通常在浏览器处理；后者说明需要向第三方接口发送网络请求。

### 4. 任何文件工具都应该显示前后对比

图片压缩：原图 4.8 MB → 输出 820 KB → 减少 82.9%。
PDF：原文件 24 页 → 输出 8 页。
OCR：5 页 → 识别 1,842 个字符。

### 5. 错误信息也应该可行动

不要只写 Invalid JSON。
应该说明第几行、第几列附近存在格式错误。
不要只写 File failed。
应该说明哪个文件失败，以及可能原因。

## 产品架构结论

GQB Tools 下一阶段不应该单纯追求工具数量继续增加。
更重要的是把现有 63 个工具逐步做成：

真正完成任务 + 解释结果 + 说明边界 + 提供下一步 + 透明处理方式。

BMI 是这一套 Explainable Utility 设计的第一批样板；后续应复制到财务计算、日期计算、单位换算、图片处理、PDF/OCR、开发者工具。
