# Publish assets (use at push / EGO submission time)

## GitHub repo (wenduof/gnome-unminimize-retarget)

Description:

    Fixes the offset-and-jump when restoring minimized Chromium/Electron
    windows (Chrome, VS Code, Obsidian) on GNOME Shell - retargets the
    unminimize animation instead of disabling it. GNOME 42-51, X11 & Wayland.

Topics:

    gnome-shell-extension, minimize, unminimize, animation, chromium,
    electron, wayland, xwayland, x11, hidpi, vscode, obsidian, bug-fix

## EGO listing

Name: Unminimize Retarget

Description (short, keyword-bearing):

    Fixes Chrome/VS Code/Obsidian windows landing offset and jumping when
    restored from the dock: retargets the unminimize animation when the
    client reconfigures the window mid-animation. GNOME 42-51.

## EGO submission checklist (needs EGO account)

1. Upload `unminimize-retarget-<sha>.zip` per branch
   (`scripts/make-zip.sh`; contents exactly `extension.js metadata.json
   LICENSE`). main serves GNOME 45-51, gnome-42 serves GNOME 42.
2. EGO assigns version numbers by upload order. The metadata `version`
   key is deprecated and ignored by EGO (the v2 upload carried
   `"version": 1` and was still numbered 2); it has been removed from
   both branches. Do not reintroduce it.
3. Review status (2026-10-16): v2 (main, 45-50) Active; v1 (gnome-42)
   Rejected - redundant `42.9` entry + advice against old-shell support
   for new extensions. Real-hardware verification then exposed a load
   blocker in the v2 zip (`logError` import, ADR 0008), fixed on main.
   Next upload: main v3 = connectObject refactor + the fix; gnome-42
   resubmit unchanged (ADR 0007 plan). Replies in
   `docs/upstream/review-replies.md`.
4. gjs-lint no longer exists (removed upstream in gjs 1.82; absent from
   Ubuntu 22.04 gjs 1.72 and 26.04 gjs 1.88). Rely on the manual
   gjs.guide review-guidelines checklist (done) + Shexli at review time.
5. Expect review latency; answer reviewer questions referencing ADR 0001
   and ADR 0007.

## Push commands (once approved)

    # rewrite already done; single identity verified
    gh repo create wenduof/gnome-unminimize-retarget --public \
      --description "<Description above>"
    git push -u origin main gnome-42
    gh api -X PUT /repos/wenduof/gnome-unminimize-retarget/topics \
      -f "names[]=gnome-shell-extension" ... (topics above)
