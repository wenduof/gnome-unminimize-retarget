# Measurements

Method: `xwininfo` + `xprop WM_STATE` polled at ~50 Hz over 25–90 s
windows while the user minimized/restored windows via titlebar button and
dock icon. Ubuntu 22.04.5, GNOME Shell 42.9, X11 session, HiDPI scale 2
(physical px below).

## Obsidian 1.14.4 (Electron, frameless: `_MOTIF_WM_HINTS` decorations=0, no `_GTK_FRAME_EXTENTS`)

Two identical cycles:

```
1792033825.590  (162,860) 2820x1682  WM_STATE: Iconic
1792033837.925  (162,860) 2820x1682  WM_STATE: Normal   <- restore click; animation starts here
1792033837.950  (130,840) 2884x1766  WM_STATE: Normal   <- +25ms: client reconfigures its own window
1792033839.523  (130,840) 2884x1766  WM_STATE: Iconic   <- minimize click
1792033839.573  (162,860) 2820x1682  WM_STATE: Iconic   <- +50ms: client reconfigures back
1792033840.978  (162,860) 2820x1682  WM_STATE: Normal
1792033841.024  (130,840) 2884x1766  WM_STATE: Normal   <- +46ms
1792033842.122  (130,840) 2884x1766  WM_STATE: Iconic
1792033842.162  (162,860) 2820x1682  WM_STATE: Iconic   <- +40ms
```

The window's X geometry differs between minimized and normal state:
inset left 32 / top 20 / right 32 / bottom 64 px (physical), i.e. the
client shrinks the window while minimized and re-expands it ~25–50 ms
after the `WM_STATE` transition. The unminimize animation (400 ms,
`EASE_OUT_EXPO`) targets the stale (minimized-state) rect read at
animation start, so it lands down-right of the real position and mutter's
post-effect actor re-sync produces the visible snap.

## gedit (GTK4, control group)

```
1792034104.860  (3788,916) 1900x2300  WM_STATE: Normal
1792034192.353  (3788,916) 1900x2300  WM_STATE: Iconic   <- geometry unchanged
1792034193.603  (3788,916) 1900x2300  WM_STATE: Normal   <- geometry unchanged
```

GTK apps do not reconfigure on minimize/restore → no offset, no jump.
Consistent with user reports that only Chromium-based apps are affected.

## Real hardware - Ubuntu 26.04, GNOME Shell 50.1 (Wayland + XWayland), 2026-10-16

Chrome (X11 ozone, isolated profile), HiDPI scale 2 (3072x1920 physical).
Extension `main` installed and ACTIVE (post-ADR-0008 build); polling as
above (~50 Hz), extension disabled for the baseline run.

### Baseline - extension disabled: 4 restore cycles, snap every time

```
1792126849.751  (138,84)  1830x2056  WM_STATE: Iconic
1792126849.763  (182,122) 1742x1968  WM_STATE: Iconic   <- +12ms: client shrinks while minimizing
1792126850.459  (182,122) 1742x1968  WM_STATE: Normal   <- restore click; animation targets stale rect
1792126850.471  (138,84)  1830x2056  WM_STATE: Normal   <- +12ms: client re-expands -> visible snap
```

Stale/final rects differ by (44,38) position and 88x88 px size; the
client reconfigures 10-24 ms after each `WM_STATE` transition - same
mechanism as the 42.9 data, only faster.

### With extension: 25 completed restores, no snap

```
1792127158.474  (182,122) 1742x1968  WM_STATE: Normal   <- restore click
1792127158.486  (138,84)  1830x2056  WM_STATE: Normal   <- +12ms: retargeted; animation lands on (138,84)
```

X-level timing unchanged (8-21 ms); the extension retargets the running
position/size tween at the first `position-changed`/`size-changed`.
Covered: 20 back-to-back cycles, 4 further clean cycles, 1 two-window
cycle; plus one cycle where the extension was disabled mid-animation on
purpose (the shell's own tween completed normally).

### Window destroyed mid-animation

```
1792127600.269  (182,122) 1742x1968  WM_STATE: Normal   <- restore click
1792127600.280  (138,84)  1830x2056  WM_STATE: Normal   <- +11ms: retargeted
1792127600.468  (window destroyed ~200ms into the 400ms tween)
```

Kill mid-animation: `unmanaged` cleanup leaves no residue
(`_watched`/`_starts`/`_unminimizing` empty in Looking Glass; see
DEVLOG 2026-10-16); journal clean; shell alive.

## Notes

- The X window is never unmapped during minimize on this stack
  (`Map State: IsViewable` throughout).
- Same class of reports on Wayland/XWayland and KWin (see README links),
  suggesting the client-side reconfigure exists in Chromium's X11 path
  and a variant of the geometry mismatch on its Wayland path.
