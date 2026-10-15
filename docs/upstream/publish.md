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

## Push commands (once approved)

    # rewrite already done; single identity verified
    gh repo create wenduof/gnome-unminimize-retarget --public \
      --description "<Description above>"
    git push -u origin main gnome-42
    gh api -X PUT /repos/wenduof/gnome-unminimize-retarget/topics \
      -f "names[]=gnome-shell-extension" ... (topics above)
