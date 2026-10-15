# 0005 - Local install via git worktree (single source of truth)

Date: 2026-10-15
Status: Accepted

## Context

The maintainer's daily machine (Ubuntu 22.04 / GNOME 42.9) runs the
extension. Editing the installed copy under
`~/.local/share/gnome-shell/extensions/` directly caused drift from the
repo (and one lost fix during the tweener->ease API correction).

## Decision

Install on the maintainer's machine as a git worktree of the `gnome-42`
branch:

```
git worktree add ~/.local/share/gnome-shell/extensions/unminimize-retarget@wenduof.github.io gnome-42
```

Edit only in the main checkout; the installed copy updates via git.

## Consequences

- **Hazard**: the live worktree is a real git checkout. Never run
  `git checkout`/`switch`/`clean`/`gc` inside it - they mutate or delete
  the running extension mid-session. Only fast-forward merges from the
  main checkout are safe here.
- The extension directory contains a `.git` file; ExtensionUtils ignores it.
- Shell restart is still required for code changes to take effect (GJS
  module cache) - worktree only removes copy drift, not the reload step.
- Regular users still install by copying files (README instructions); the
  worktree trick is maintainer-only.
