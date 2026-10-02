# GQB Agent Integration

GQB is being designed so that the same tool definitions can serve people, search systems, workflows, APIs, and AI agents.

## Current state

The web interface is the current execution interface. The repository now exposes a machine-readable contract model and a declarative workflow catalog, but API/MCP execution is intentionally not advertised as available yet.

## Contract principles

- One canonical tool identity: gqb:<slug>.
- Separate tool metadata from runtime policy and explanatory content.
- Prefer browser-local execution when practical.
- Make network use and file limits explicit.
- Return structured results so a future agent can verify outputs.
- Keep deterministic calculations outside the language model.

## Planned interfaces

1. Static discovery manifest: /.well-known/gqb.json
2. Tool registry: /api/tools.json
3. Workflow registry: /api/workflows.json
4. Future API: OpenAPI with explicit input/output schemas.
5. Future MCP server: expose only tools whose contracts and execution policies are agent-ready.

## Agent safety model

An agent should not infer privacy, side effects, or file limits from prose. Those properties should come from the contract. A future execution layer should validate inputs against schemas, enforce runtime policies, execute the selected tool, validate the structured result, and only then let a model explain it.

## Recommended future flow

user intent → task planner → tool selection → input validation → execution → result validation → explanation

The model should choose and orchestrate tools, not silently replace deterministic calculations with generated arithmetic.
