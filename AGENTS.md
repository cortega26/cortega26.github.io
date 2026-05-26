# AGENTS.md

## CodeGraph

When `.codegraph/` exists in this repository, prefer the CodeGraph MCP server for exploration before broad file scanning.

Use CodeGraph to:
- find symbols and candidate files
- inspect callers, callees, and nearby relationships
- estimate impact before changing shared code
- confirm the index status when results look incomplete

Use direct file reads after CodeGraph has narrowed the target, or when the task depends on exact copy, markup, or generated output.
