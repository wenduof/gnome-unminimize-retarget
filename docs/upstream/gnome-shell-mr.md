# gnome-shell MR draft (not yet filed)

**Project:** gnome-shell, `js/ui/windowManager.js`
**Addresses:** mutter #2317 (open since 2022)

## Proposal

In `_unminimizeWindow()`, the position/scale tween targets
`get_buffer_rect()` snapshotted at animation start. Chromium/Electron
clients reconfigure their own windows ~25-50 ms after the `WM_STATE`
transition (see crbug draft), so the snapshot goes stale mid-animation and
the actor snaps to the real rect when the effect completes.

Retarget the running tween when the window moves during the animation:

- On `unminimize`, for the icon-targeted (non-fade) path, connect to the
  MetaWindow's `position-changed` / `size-changed`.
- While the actor is in `this._unminimizing` and the window is not
  monitor-sized, re-issue `actor.ease({x, y, duration: remaining, mode})`
  with the fresh `get_buffer_rect()`.
- Disconnect on effect completion / window unmanaged.

## Working reference implementation

https://github.com/wenduof/gnome-unminimize-retarget (GNOME 42 and 45-50
branches, visually verified on 42.9 X11 HiDPI; ~70 lines, no settings).
The extension hooks the same signals from outside the shell; an internal
fix can use the effect's own completion handler for teardown.

## Why in-shell rather than an extension long-term

- No private-API dependency (`_unminimizing` etc.) to churn on releases.
- Teardown can hook the animation completion directly instead of relying
  on signal lifetime.

## Open questions for review

- Should the retarget also cover the fade path (currently no-op)?
- Damping: a single retarget per animation, or one per ConfigureNotify?
  The extension does one per signal and looks smooth; expo easing absorbs
  repeats.

## Status

- Draft until: real-hardware visual test on GNOME 50 (26.04), crbug
  filed with XWayland data.
