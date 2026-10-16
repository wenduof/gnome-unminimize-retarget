# Development Log

Newest entries at the top. One entry per meaningful step; details of design
choices live in `docs/decisions/`.

## 2026-10-16 - Real-hardware verification on 26.04 / GNOME Shell 50.1; load-blocker fix

- Fixed a load blocker present in the v2 zip: extension.js imported
  `logError` from `misc/util.js`, which never exported it on GNOME 45-51
  (sources + shipped gresource checked) - strict ESM import means a
  load-time SyntaxError on every supported shell. Now uses the gjs
  `logError` global (ADR 0008). Reinstalled via logout/login; extension
  ACTIVE, journal clean.
- Repro confirmed on real hardware: X11 Chrome (XWayland, HiDPI 2x)
  reconfigures its window 10-24 ms after `WM_STATE` Normal (stale rect
  (182,122) 1742x1968 -> (138,84) 1830x2056, offset (44,38)); snap in
  all 4 baseline cycles with the extension disabled.
- With the extension: 26 restore transitions measured (20 back-to-back,
  4 more clean, 1 killed mid-animation, 1 two-window) - no snap in any
  completed run. X-level reconfigure timing is unchanged (8-21 ms):
  only the animation is retargeted. See measurements.md.
- Stress matrix: rapid re-minimize during animation; disable
  mid-animation (the shell's own tween still completes correctly; after
  re-enable, restores are retargeted again); kill mid-animation (window
  destroyed ~200 ms into the 400 ms tween - clean `unmanaged` cleanup,
  shell alive, no journal errors); two windows restoring together;
  controls (GTK Files, maximized Chrome) unaffected.
- No-residue check in Looking Glass after closing all test windows:
  `_watched` / `_starts` / `Main.wm._unminimizing` all empty; journal
  free of extension errors for the whole session.
- README compat tables now mark 50.1 as visually verified (+ stress).
  main v3 zip (connectObject + this fix) prepared for EGO re-upload;
  v3 note drafted in docs/upstream/review-replies.md.

## 2026-10-16 - EGO review round 1 incorporated; GNOME 51

- EGO reviews by JustPerfection: v1 (gnome-42 zip) rejected - remove the
  redundant `42.9` entry; "better not to send old shell version support
  for new extensions". v2 (main zip, 45-50) Active with a request for
  `connectObject()`/`disconnectObject()`.
- Both branches refactored to `connectObject()`/`disconnectObject()`
  tracked by the extension instance (`_watched` is now a `Set`; `_wmConn`
  gone). Available on 42.9: shell patches `GObject.Object` in
  `environment.js`. Static checks pass (gjs + node --check); reload
  verified (State ENABLED, journal clean, restores visually correct).
- API cross-check 42-51: `connectObject` body in 42.9 and 45.0
  signalTracker.js is line-identical (ESM syntax aside); 46.0/50.0/51.0
  `environment.js` still patch `GObject.Object.prototype`; offline gjs
  1.72.4 test (plain-JS tracker, two emitters) confirms
  `disconnectObject()` cleanup.
- Metadata: `version` dropped (deprecated; EGO ignores it - the v2 upload
  carried `"version": 1` and was numbered 2); gnome-42 shell-version
  fixed to `["42"]`; main extended to `"51"` (released 2026-09-16;
  `_unminimizing` / `_unminimizeWindow` / `get_buffer_rect` unchanged in
  gnome-shell 51.0).
- Decision (ADR 0007): resubmit the GNOME 42 package once, with a
  rationale reply on review 76461 (Ubuntu 22.04 LTS until 2027-04,
  frozen branch, verified environment). If rejected again: GitHub-only,
  no further attempts. Replies drafted in docs/upstream/review-replies.md.

## 2026-10-15 - published; EGO prep

- Repo pushed to https://github.com/wenduof/gnome-unminimize-retarget
  (main + gnome-42, description, 13 topics). Public-history privacy
  re-verified: single noreply identity, zero sensitive strings.
- dash-to-dock #2085 reply posted (link to repo + ozone mitigation).
  Drafts for mutter #2317 / Launchpad 824267 / KWin #518357 handed to
  maintainer (those sites need personal accounts).
- gjs-lint is gone upstream (removed in gjs 1.82; not in Ubuntu 22.04's
  1.72 nor 26.04's 1.88). EGO review's Shexli + manual gjs.guide
  checklist cover the same ground. EGO checklist (incl. the
  strictly-increasing `version` requirement for the two-branch uploads)
  added to docs/upstream/publish.md.

## 2026-10-15 - uuid rename verified end-to-end; review incorporated

- Renamed uuid verified on the maintainer machine (GNOME 42.9, X11, HiDPI):
  Obsidian/VSCode restore animations visually correct with
  `unminimize-retarget@wenduof.github.io`.
- Shell quirk found: after a uuid change, the first `gnome-extensions
  enable` can leave state at `INITIALIZED` (no error, no journal entry);
  a `disable` -> `enable` cycle fixes it. Documented in both READMEs.
- VM (26.04 / GNOME 50.1, software rendering): extension ACTIVE, zero JS
  errors. Visual test cancelled by decision - the VM has no 3D (Ubuntu
  gnome-shell disables animations under software rendering anyway).
- External review adjudicated -> ADR 0006. Adopted: try/catch degrade-once
  in `_retarget`, `_starts` keyed by window (leak fix), metadata `version`,
  worktree hazard note, ozone interim option in READMEs. Rejected with
  reasons: late-reconfigure gate widening, watch teardown.
- Reviewer corroborated against gnome-shell 46.0 sources: `_unminimizeWindow`
  unchanged since 42; all three private APIs we use are present.

## 2026-10-15 - Compliance pass (gjs.guide review guidelines)

- uuid renamed to `unminimize-retarget@wenduof.github.io` (EGO requires a
  domain/account namespace); GitHub remote will be `wenduof/gnome-unminimize-retarget`.
- Git identity for this repo: `wenduof <19146532+wenduof@users.noreply.github.com>`
  (keeps employer email out of published history; earlier prototype commits
  used a local identity and must be squashed/rewritten before first push).
- Code restyled to GJS 4-space style on both branches.
- gjs-lint not available on Ubuntu 22.04 (gjs 1.72); run it on a newer
  distro before EGO submission.

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
