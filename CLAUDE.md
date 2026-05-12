# Project guidelines

## Efficiency

- **Prefer direct tools over agents for quick lookups.** Use `grep`/`Read` directly instead of spawning `Agent`/`Explore` for tasks that take under a minute. Agents burn ~1.6M tokens and real time; most fixes need a single file read.
- Don't over-plan simple fixes. Read the relevant file, make the edit, done.
