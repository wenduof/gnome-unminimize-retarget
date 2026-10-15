# Publish assets (use at push / EGO submission time)

## GitHub repo (wenduof/gnome-unminimize-retarget)

Description:

    Fixes the offset-and-jump when restoring minimized Chromium/Electron
    windows (Chrome, VS Code, Obsidian) on GNOME Shell - retargets the
    unminimize animation instead of disabling it. GNOME 42-50, X11 & Wayland.

Topics:

    gnome-shell-extension, minimize, unminimize, animation, chromium,
    electron, wayland, xwayland, x11, hidpi, vscode, obsidian, bug-fix

## EGO listing

Name: Unminimize Retarget

Description (short, keyword-bearing):

    Fixes Chrome/VS Code/Obsidian windows landing offset and jumping when
    restored from the dock: retargets the unminimize animation when the
    client reconfigures the window mid-animation. GNOME 42-50.

## EGO submission checklist (needs EGO account)

1. Upload `unminimize-retarget-<main-sha>.zip` first (metadata `version: 1`,
   shell 45-50).
2. Before the second upload, bump the `gnome-42` branch metadata to
   `version: 2` (EGO requires strictly increasing versions per upload),
   rebuild its zip, upload (shell 42).
3. Zip contents must be exactly `extension.js metadata.json LICENSE`
   (`scripts/make-zip.sh` guarantees this).
4. gjs-lint no longer exists (removed upstream in gjs 1.82; absent from
   Ubuntu 22.04 gjs 1.72 and 26.04 gjs 1.88). Rely on the manual
   gjs.guide review-guidelines checklist (done) + Shexli at review time.
5. Expect review latency; answer reviewer questions referencing ADR 0001
   (private-API guards) and ADR 0006 (degrade-once).

## Push commands (once approved)

    # rewrite already done; single identity verified
    gh repo create wenduof/gnome-unminimize-retarget --public \
      --description "<Description above>"
    git push -u origin main gnome-42
    gh api -X PUT /repos/wenduof/gnome-unminimize-retarget/topics \
      -f "names[]=gnome-shell-extension" ... (topics above)
