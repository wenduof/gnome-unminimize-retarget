# AGENTS.md

Working notes for humans and AI agents maintaining this repository.

## What this project is

A GNOME Shell extension that fixes the "unminimize lands offset down-right,
then snaps back" glitch affecting Chromium/Electron windows. See README.md
for user-facing docs and docs/measurements.md for the diagnostic data.

## Repository layout

- `main` branch: ESM extension, GNOME 45-51 (`shell-version` in metadata.json).
- `gnome-42` branch: classic `imports.*` JS, GNOME 42 only. Branches differ in
  `extension.js` and `metadata.json` ONLY; docs are shared.
- `docs/decisions/`: ADRs - read these before changing any design choice.
- `docs/DEVLOG.md`: dated progress log; append an entry for every meaningful change.
- `docs/measurements.md`: raw diagnostic data behind the root cause. Do not edit
  historical entries; append new measurements with date and environment.
- `scripts/measure.sh`: reproduces the diagnosis (geometry + WM_STATE polling).

## How the fix works (invariants)

1. Connect to `global.window_manager` signal `unminimize` AFTER WindowManager
   has connected (extension loads later), so the original animation exists.
2. While `Main.wm._unminimizing` contains the actor, retarget the position
   tween on `position-changed` / `size-changed` to `get_buffer_rect()`.
3. Never touch windows that are not mid-unminimize, and never the
   `is_monitor_sized()` (fade-only) path.

These three guards are what make the extension a no-op for GTK apps and
maximized windows. Do not remove them.

## Testing

- GNOME 42 (X11): install to `~/.local/share/gnome-shell/extensions/<uuid>/`,
  reload shell with Alt+F2 + `r` (new extensions and code changes are NOT
  picked up without a shell restart; GJS caches failed imports), then
  `gnome-extensions enable <uuid>`. Verify with `scripts/measure.sh` plus
  visual check: no snap-back after restore.
- GNOME 45+ (Wayland): log out/in instead of Alt+F2 r. Check
  `gnome-extensions info <uuid>` shows ACTIVE and
  `journalctl -b | grep "JS ERROR"` is clean.
- Known limitation: Ubuntu's gnome-shell disables animations under software
  rendering (VMs without virgl), so VMs can only verify "loads clean", not
  the visual fix.

## Style rules

- GJS style: 4-space indent, single quotes, semicolons (match windowManager.js).
- No `console.log` in shipped code.
- `enable()`/`disable()` must be symmetric: every connect has a disconnect.
- Signal management: `connectObject()`/`disconnectObject()` tracked by the
  extension instance (the GNOME Shell 42+ idiom).

## Do not

- Do not edit the installed copy under `~/.local/share/gnome-shell/extensions/`
  directly on the maintainer's machine - it is a `git worktree` of the
  `gnome-42` branch; edit the repo instead.
- Do not rebase or force-push published branches.
- Do not "fix" Chromium behavior here; the client-side reconfigure is upstream's
  bug (links in README). We only make the compositor follow.
