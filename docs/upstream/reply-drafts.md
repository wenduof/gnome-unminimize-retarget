# Bug-thread reply drafts (post AFTER GitHub push)

Each reply: 2-3 sentences + link. No personal info, no promises.

## mutter #2317 (gitlab.gnome.org/GNOME/mutter/-/issues/2317)

> Root cause here is client-side: Chromium reconfigures its X11 window
> ~25-50 ms after the WM_STATE transition (measured: inset by the frame,
> L32/T20/R32/B64 at 2x), so the rect snapshotted at animation start is
> already stale. A working compositor-side mitigation (retarget the
> unminimize tween on position-changed) exists as a GNOME extension:
> https://github.com/wenduof/gnome-unminimize-retarget - happy to see the
> logic upstreamed; the extension is ~70 lines and GPL-2.0-or-later.

## Launchpad question 824267 (answers.launchpad.net/ubuntu/+question/824267)

> It's a known Chromium-on-XWayland issue (mutter #2317): Chromium moves
> its own window shortly after restore, and the animation targets the
> pre-move position. Until upstream fixes it, two workarounds: run
> Electron/Chromium with `--ozone-platform=wayland` (native Wayland path,
> no X11 geometry involved), or install this extension which retargets
> the animation to the corrected position:
> https://github.com/wenduof/gnome-unminimize-retarget

## dash-to-dock #2085

> Same root cause as mutter #2317 (Chromium reconfigures its window
> mid-animation on XWayland); not dock-specific. Client-side mitigation
> (`--ozone-platform=wayland`) and a compositor-side extension fix are
> linked there: https://github.com/wenduof/gnome-unminimize-retarget

## KWin #518357 (bugs.kde.org)

> The Chromium side is confirmed: it reconfigures its X11 window ~25-50 ms
> after WM_STATE changes (frame-inset bounds). A GNOME-side equivalent fix
> (retarget the restore tween on geometry change) is here, with
> measurements: https://github.com/wenduof/gnome-unminimize-retarget -
> same approach should apply to KWin's restore animation.

## Posting checklist

- [ ] repo pushed, links resolve
- [ ] one account, neutral tone, no "we invented"
- [ ] re-check each draft for personal info before posting
