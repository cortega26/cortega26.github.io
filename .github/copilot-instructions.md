# CodeGraph usage

When this repository contains a `.codegraph/` directory, prefer the CodeGraph MCP server for structural code exploration before broad text searches.

Use CodeGraph first to:
- locate symbols and relevant files
- inspect callers and callees
- check impact radius before edits
- understand file layout and indexed status

Fall back to manual file reads and text search when:
- the graph is missing or stale
- the task depends on prose, copy, or raw markup details
- you need exact line-level context after narrowing the target with CodeGraph
