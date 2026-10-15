# Development Log

Newest entries at the top. One entry per meaningful step; details of design
choices live in `docs/decisions/`.

## 2026-10-15 - docs structure adopted (ADR + DEVLOG + AGENTS.md)

English-first for all repo content; user-facing README gets a separate
`README.zh-CN.md` cross-linked from `README.md`.

## 2026-10-15 - ESM port verified on GNOME 50.1 (VM)

- `main` branch ESM extension loads clean on Ubuntu 26.04 VM
  (`State: ACTIVE`, no JS errors).
- Two load-time bugs found and fixed: `ui/main.js` has no default export
  (use namespace import); GJS caches failed imports, so code fixes require a
  shell restart (log out/in on Wayland).
- VM cannot verify the visual fix: Ubuntu's gnome-shell disables animations
  under software rendering (virtio-gpu without virgl). Host-side virgl attempt
  failed: qemu 6.2 (Ubuntu 22.04) SPICE GL cannot initialize EGL on the
  NVIDIA host GPU; needs qemu >= 7.0. VM resolution was lowered
  2320x1670 -> 1920x1080 via Mutter DisplayConfig during the attempt.
- Visual verification deferred to real 26.04 hardware.

## 2026-10-15 - Initial extension verified on GNOME 42.9 (X11, HiDPI scale 2)

- `gnome-42` branch extension enabled on the reporter's machine: snap-back
  gone for Obsidian and VS Code, no regressions for GTK apps.
- First iteration used `imports.ui.tweener` - removed in GNOME 41+; the
  42-era API is `actor.ease()`. Fixed before release.

## 2026-10-15 - Root cause confirmed by measurement

- `scripts/measure.sh`-style polling (~50 Hz `xwininfo` + `xprop WM_STATE`)
  during minimize/restore cycles.
- Obsidian (Electron): X geometry changes 25-50 ms after every `WM_STATE`
  Iconic/Normal transition (inset L32/T20/R32/B64 physical px while
  minimized). gedit (GTK4): geometry never changes. See measurements.md.
- Conclusion: client-side reconfigure + compositor's stale animation target.
  GTK apps unaffected, matching user reports.

## 2026-10-15 - Diagnosis started

- Symptom: restore-from-dock animation lands down-right of the real position,
  then snaps; only VS Code / Obsidian (Electron) on GNOME 42.9 X11 and
  GNOME 50.1 Wayland; GTK apps fine.
- Ruled out: the historical frame_rect/buffer_rect overshoot bug (fixed
  upstream in 2021, present in both versions); frame extents (the affected
  windows are frameless, `_MOTIF_WM_HINTS` decorations=0).
- Found matching unfixed upstream reports: mutter #2317, LP #824267,
  KWin #518357, dash-to-dock #2085.
