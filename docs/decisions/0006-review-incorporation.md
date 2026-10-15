# ADR 0006 - External review incorporation (2026-10-15)

Status: accepted

An external assistant review of the diagnosis and implementation was
adjudicated item by item.

## Adopted

- **API-lifetime defense (review #2)**: `_retarget()` now wraps the private
  API usage (`Main.wm._unminimizing`, `is_monitor_sized`, `get_buffer_rect`)
  in try/catch. On failure it logs once and `_unwatch()`es the window, so a
  future GNOME that drops these APIs degrades quietly instead of spamming
  the journal on every window move. `get_frame_rect()` is a safe fallback
  because affected windows are frameless (frame rect == buffer rect).
- **`_starts` leak (review #3)**: `_starts` is keyed by `MetaWindow`
  (was: actor, which is already dead at `unmanaged` time and could never be
  pruned) and deleted in `_unwatch()`.
- **metadata `version` (review #7)**: integer `version: 1` added (EGO
  convention).
- **Live-worktree hazard (review #6)**: the README install steps already use
  plain `cp`; the worktree-as-install-dir trick is our dev setup only. ADR
  0005 now carries an explicit warning: never run `git checkout`/`clean`/
  `gc` inside the live worktree.
- **ozone interim option**: README documents
  `--ozone-platform=wayland` for Electron on Wayland sessions as a
  client-side mitigation that bypasses the whole X11 geometry path.

## Rejected (with reasons)

- **Widening the gate for late reconfigures > 400 ms (review #4)**: after
  the tween completes there is no running animation to retarget; calling
  `ease()` then would start a *new* tween and turn the snap into a slow
  drift. The ordering of `position-changed` vs the actor re-sync at effect
  end is unmeasured. No evidence, no change. Revisit only if field reports
  show the single-frame jump surviving.
- **Disconnecting watches after the effect (review #5)**: the watch gate is
  a `Set.has()` lookup; cost is negligible. Hooking effect completion adds
  complexity for no measurable gain.

## Corroboration from the review

Reviewer independently checked gnome-shell 46.0 sources: `_unminimizeWindow`
structure unchanged from 42; `get_buffer_rect()`, `is_monitor_sized()` and
`Main.wm._unminimizing` all present in 46.0. This narrows (but does not
replace) the need for a 50.x real-hardware visual test.
