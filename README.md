# Unminimize Retarget

English | [简体中文](README.zh-CN.md)

A tiny GNOME Shell extension that fixes the **"restored window lands
offset down-right, then snaps back"** glitch affecting **Chromium /
Electron** windows (Chrome, VS Code, Obsidian, Slack, ...) — without
disabling any animations.

**Why trust it:**

- **Green** — one ~70-line `extension.js`. No settings, no daemon, no
  external processes, no network.
- **No side effects** — it only acts on a window that is mid-unminimize
  *and* actually moves during the animation. GTK apps, maximized windows
  and everything else are untouched (verified: gedit/nautilus geometry
  never triggers the code path).
- **Fully reversible** — `gnome-extensions disable
  unminimize-retarget@wenduof.github.io` and the directory removal leaves
  zero state behind.
- **Degrades gracefully** — it uses private shell internals; if a future
  GNOME changes them, the extension errors out and you simply get the
  original (buggy) animation back, never a broken desktop.
- **Compatible** — GNOME 42 (Ubuntu 22.04) through 50 (Ubuntu 26.04),
  X11 and Wayland, HiDPI. Two branches, same logic.

## Symptom

With a non-maximized Chromium-based window: minimize it to the dock, click
the icon to restore. The restore animation ends at a position offset
**down and to the right** of the window's real position, then the window
visibly **jumps** up-left into place. GTK apps are unaffected.

Reported (without a fix) in:

- [mutter #2317](https://gitlab.gnome.org/GNOME/mutter/-/issues/2317) — open since 2022
- [Launchpad #824267](https://answers.launchpad.net/ubuntu/+question/824267) — Ubuntu 26.04, Chrome/Brave
- [KWin #518357](https://bugs.kde.org/show_bug.cgi?id=518357) — Chrome on Plasma Wayland
- [dash-to-dock #2085](https://github.com/micheleg/dash-to-dock/issues/2085)

## Root cause

Measured with `scripts/measure.sh` (~50 Hz `xwininfo`/`xprop` polling;
full data in [docs/measurements.md](docs/measurements.md)):

| time | event | X geometry (physical px) |
|---|---|---|
| t+0 | `WM_STATE` → Normal (restore) | `(162,860) 2820x1682` ← animation uses this |
| t+25ms | **client reconfigures its own window** | `(130,840) 2884x1766` ← real position |
| t+400ms | animation ends, mutter re-syncs actor | the visible jump |

Chromium's X11 window code re-applies its bounds ~25–50 ms after the
`WM_STATE` Iconic/Normal transition. GNOME Shell's `_unminimizeWindow()`
reads `get_buffer_rect()` once, at animation start, and tweens to that now
stale rect for 400 ms. When the effect completes, mutter unfreezes the
window actor and syncs it to the real buffer rect — the snap. GTK apps
never reconfigure on minimize/restore, so they are unaffected.

## How this extension fixes it

While an unminimize animation is running, listen for the window's
`position-changed` / `size-changed` signals and **retarget the running
position tween** to the new buffer rect. The animation smoothly curves to
the real destination instead of the stale one.

## Install

### GNOME 45–50 (Ubuntu 23.10+, Fedora 39+, ...)

```bash
git clone https://github.com/wenduof/gnome-unminimize-retarget
cd gnome-unminimize-retarget   # main branch
mkdir -p ~/.local/share/gnome-shell/extensions/unminimize-retarget@wenduof.github.io
cp extension.js metadata.json ~/.local/share/gnome-shell/extensions/unminimize-retarget@wenduof.github.io/
# restart the shell (X11: Alt+F2, r; Wayland: log out/in), then:
gnome-extensions enable unminimize-retarget@wenduof.github.io
```

### GNOME 42 (Ubuntu 22.04)

Use the [`gnome-42`](../../tree/gnome-42) branch (same logic, classic
`imports.*` JS; GNOME 42 cannot load ESM extensions):

```bash
git clone -b gnome-42 https://github.com/wenduof/gnome-unminimize-retarget
cd gnome-unminimize-retarget
mkdir -p ~/.local/share/gnome-shell/extensions/unminimize-retarget@wenduof.github.io
cp extension.js metadata.json ~/.local/share/gnome-shell/extensions/unminimize-retarget@wenduof.github.io/
```

## Compatibility

| GNOME | branch | status |
|---|---|---|
| 42.9 (Ubuntu 22.04, X11, HiDPI) | `gnome-42` | visually verified |
| 45–49 | `main` | expected to work (windowManager unchanged in these areas), not tested |
| 50.1 (Ubuntu 26.04, Wayland) | `main` | loads clean; visual test pending real hardware |

## Uninstall

```bash
gnome-extensions disable unminimize-retarget@wenduof.github.io
rm -rf ~/.local/share/gnome-shell/extensions/unminimize-retarget@wenduof.github.io
```

## Known limitations

- Uses private shell/mutter internals (`Main.wm._unminimizing`,
  `global.window_manager` signals, `position-changed`). A future GNOME
  release may need an update; if the extension errors out it degrades
  gracefully to the original (buggy) animation.
- The client-side reconfigure itself is not fixed — Chromium still moves
  the window mid-animation; this extension makes the compositor follow.
  The proper fix is upstream (see links above).

## Upstream

- Chromium: X11 window is reconfigured with an offset shortly after
  `WM_STATE` minimize/restore transitions (crbug pending).
- gnome-shell: `_unminimizeWindow()` should retarget the tween on
  `position-changed` (MR pending). If merged, this extension becomes
  obsolete — that is the goal.

## License

GPL-2.0-or-later
