# 0008 - Global `logError`; no `misc/util.js` import (2026-10-16)

Date: 2026-10-16
Status: Accepted

## Context

Real-hardware verification on Ubuntu 26.04 (GNOME Shell 50.1, gjs 1.88)
exposed a load failure in the v2 build: `extension.js` imported
`{ logError }` from `resource:///org/gnome/shell/misc/util.js`. That
module has never exported `logError` on GNOME 45-51 (export lists
checked in 45.0/46.0/50.1/51.0 sources and in the shipped gresource).
GJS ESM imports are static and strict: a missing named export aborts
module evaluation, so the extension failed to load on every supported
version. No VM test or static check had exercised the real ESM import.

## Decision

- **Drop the import and call the `logError` global.** gjs defines
  `logError` as a global (verified on 1.72-1.88); gnome-shell's own
  modules call it without any import. It is safe on all supported
  versions.

## Consequences

- extension.js loads again on 45-51; live-verified on 50.1 with the
  full stress matrix and a clean journal (DEVLOG 2026-10-16).
- gnome-42 is unaffected (`imports.misc.util.logError` exists there);
  that branch stays as tested.
- Rule going forward: extension imports must reference exports verified
  in the shipped module of each supported shell, not assumed from
  another version's sources.
