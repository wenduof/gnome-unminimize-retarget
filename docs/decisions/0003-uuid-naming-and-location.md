# 0003 - Naming: uuid, extension name, repo location

Date: 2026-10-15
Status: Accepted

## Context

GNOME extension conventions: uuid is conventionally `<name>@<author>`,
must be unique and stable (it is the install directory name and the key in
shell state). EGO review expects a descriptive name and a uuid that does not
collide with existing extensions.

## Decision

- uuid: `unminimize-retarget@wenduof.github.io` (same on both branches).
- Display name: "Unminimize Retarget".
- Repo: `gnome-unminimize-retarget`, kept locally under the maintainer's
  workspace; GitHub org/user `wenduof` is the intended remote once published.

## Consequences

- The uuid embeds the repo name; renaming the repo later would create a
  cosmetic mismatch (uuid is immutable once published - changing it breaks
  existing installs' settings/state).
- An earlier prototype uuid `fix-unminimize-offset@local` was renamed before
  any publication; no migration needed.
