# 0002 - Two branches: classic JS for GNOME 42, ESM for 45+

Date: 2026-10-15
Status: Accepted

## Context

The reporter uses Ubuntu 22.04 (GNOME 42.9, X11) and Ubuntu 26.04
(GNOME 50.1, Wayland). GNOME 45+ extensions must be ES modules; GNOME 42
cannot load ESM extensions. The unminimize code path in windowManager.js is
nearly line-identical between 42.9 and 50.1 (both use `actor.ease()` and
`get_buffer_rect()` at animation start), and mutter 42/50 both expose
`position-changed`/`size-changed` on MetaWindow.

## Decision

Maintain two branches that differ only in `extension.js` and
`metadata.json`:

- `main`: ESM, `shell-version: ["45".."50"]`.
- `gnome-42`: classic `imports.*`, `shell-version: ["42","42.9"]`.

Docs, LICENSE and scripts are shared; `gnome-42` merges `main` with
`-X ours` to keep its code files while picking up doc updates.

## Consequences

- No runtime version-detection hacks inside the extension.
- Contributors must keep the two extension.js files logically in sync
  (AGENTS.md notes this).
- GNOME 43/44 (transitional, ESM-capable) are covered by `main` in principle
  but untested; not advertised in `shell-version`.
