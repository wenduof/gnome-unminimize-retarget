# 0004 - License: GPL-2.0-or-later

Date: 2026-10-15
Status: Accepted

## Context

The extension is derivative work of GNOME Shell's windowManager.js
(extensions run inside the shell process and mirror its internal APIs).
GNOME Shell is GPL-2.0-or-later. extensions.gnome.org requires an OSI
license and most reviewed extensions are GPL-2+/GPL-3.

## Decision

GPL-2.0-or-later, full text in LICENSE.

## Consequences

- Compatible with upstreaming the retarget patch into gnome-shell (same
  license), which is the stated end goal.
- Upstream contributions (gnome-shell MR) require following GNOME's
  contributor process (Developer Certificate of Origin); the license choice
  keeps that frictionless.
