# 0001 - Retarget the unminimize animation instead of disabling it

Date: 2026-10-15
Status: Accepted

## Context

Chromium/Electron clients reconfigure their own X window 25-50 ms after the
`WM_STATE` Iconic/Normal transition (see ../measurements.md). GNOME Shell's
`_unminimizeWindow()` reads `get_buffer_rect()` once at animation start and
tweens to that stale rect for 400 ms; mutter's post-effect actor re-sync then
produces the visible snap-back.

Options considered:

1. Disable/replace the minimize animation (Animation Tweaks extension,
   `enable-animations false`). Kills the symptom but also the animation,
   globally, and for every window class.
2. Wait/delay reading the rect (e.g. +100 ms). Racy: the client's
   reconfigure timing is not guaranteed; adds perceived latency.
3. Retarget the running position tween when the window's
   `position-changed`/`size-changed` signals fire during unminimize.
   Event-driven, exact, no-op when nothing moves.
4. Fix upstream only (Chromium and/or gnome-shell). Correct long-term but
   mutter #2317 has been open since 2022; users need a fix now.

## Decision

Option 3, implemented as a small extension; pursue option 4 in parallel
(crbug + gnome-shell MR) with the goal of making this extension obsolete.

## Consequences

- Depends on private internals (`Main.wm._unminimizing`,
  `global.window_manager` signals); needs re-verification on each GNOME major
  release. Failure mode is graceful: extension errors out, original behavior
  returns.
- The client-side reconfigure itself remains; we make the compositor follow it.
