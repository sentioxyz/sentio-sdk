#!/usr/bin/env node
// Committed bin entrypoint so the `sentio` shim links at `pnpm install` time even
// before the bundle is built (pnpm skips a workspace bin whose target is absent).
// Loads the esbuild-bundled CLI, which runs the commander program on import.
import './dist/index.js'
