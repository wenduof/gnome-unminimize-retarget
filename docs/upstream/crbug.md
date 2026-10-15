# crbug draft (not yet filed)

**Component:** Blink>Platform>WindowManagement>UI>Desktop>Linux (X11)
**Severity:** normal (visual glitch in third-party compositors)

## Summary

On X11, Chromium/Electron reconfigures its own top-level window (position
and size) ~25-50 ms after a `WM_STATE` Iconic<->Normal transition, using
bounds inset by the window frame (measured: left 32, top 20, right 32,
bottom 64 physical px at 2x scale). Compositors that snapshot the window
geometry at the moment of the state change (GNOME Shell unminimize
animation, KWin restore) then animate to the stale rect and snap when the
client's reconfigure lands.

## Environment

- Ubuntu 22.04.5, X11, HiDPI scale 2, GNOME Shell 42.9
- Obsidian (flatpak, Electron), VS Code (deb)
- Reproduced identically on reports from Ubuntu 26.04 XWayland
  (Launchpad #824267) and KDE Plasma Wayland/XWayland (KWin #518357)

## Reproduce (measurement, not eyeball)

Poll `xwininfo -id <win>` + `xprop WM_STATE -id <win>` at ~50 Hz while
minimizing/restoring via the GNOME dock. Script:
`scripts/measure.sh` in https://github.com/wenduof/gnome-unminimize-retarget

## Measured (Obsidian, one restore cycle)

| time | event | geometry (physical px) |
|---|---|---|
| t+0 | WM_STATE -> Normal | (162,860) 2820x1682 |
| t+25ms | **client XConfigureWindow** | (130,840) 2884x1766 |
| t+50ms | stable | (130,840) 2884x1766 |

The minimized-state geometry is inset by exactly the frame extents
(L32/T20/R32/B64). GTK apps (gedit control group) never reconfigure on
minimize/restore.

## Expected

The window's position/size should not change as a side effect of
minimize/restore state transitions; if a reconfigure is unavoidable, it
should happen before/at the `WM_STATE` change, not asynchronously after.

## Actual

Asynchronous reconfigure 25-50 ms after the state change, with frame-inset
bounds.

## Impact

- GNOME Shell: restore animation lands offset down-right, then jumps
  (mutter #2317, open since 2022; dash-to-dock #2085)
- KWin: same glitch on Wayland sessions (KWin #518357)

## Notes

- Windows are frameless (`_MOTIF_WM_HINTS` decorations=0); the inset
  values match Chromium's own frame metrics, suggesting the X11 window
  code re-applies frame-adjusted bounds on state change.
- Workaround compositors can use today: retarget the running animation on
  `ConfigureNotify` (working reference: the GNOME extension in the repo
  above).
- Client-side mitigation for users: `--ozone-platform=wayland` on Wayland
  sessions avoids the X11 path entirely.
- TODO before filing: capture the same table on GNOME 50 XWayland
  (real hardware; VM lacks 3D).
