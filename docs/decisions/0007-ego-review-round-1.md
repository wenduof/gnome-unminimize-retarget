# 0007 - EGO review round 1 (2026-10-15/16)

Date: 2026-10-16
Status: Accepted

## Context

First EGO reviews, both by JustPerfection (EGO moderator):

- Review 76461 (v1 = gnome-42 upload): **Rejected**. "1. Please remove
  `42.9`. 2. Better to not to send old shell version support for new
  extensions."
- Review 76462 (v2 = main upload, 45-50): **Active** (approved) with
  "please use `connectObject()` and `disconnectObject()`".

## Decisions

- **Adopt `connectObject()`/`disconnectObject()`** on both branches,
  tracked by the extension instance. `_watched` becomes a `Set`; handler
  ids and `_wmConn` disappear. The idiom exists since GNOME 42 (shell
  patches `GObject.Object` from `environment.js`), matching the shell's
  own code.
- **`shell-version: ["42"]`** on gnome-42: `42` covers all 42.x point
  releases; point-release entries are redundant (review item 1).
- **Drop `version`** from both metadata files: deprecated, and EGO
  overrides it with its own upload numbering (empirical: the v2 upload
  carried `"version": 1` and became version 2 anyway).
- **main adds `"51"`** (current stable since 2026-09-16). gnome-shell
  51.0 sources keep `_unminimizing`, `_unminimizeWindow` and
  `get_buffer_rect` in the shape the extension relies on.
- **GNOME 42 package: resubmit once.** Review item 2 is advisory
  ("Better to not..."), EGO has no rule against old-shell packages, the
  branch is frozen (no ongoing maintenance) and 42.9 is the tested
  environment (Ubuntu 22.04 LTS supported until 2027-04). The reply on
  76461 states this and offers to withdraw if the reviewer prefers. If
  rejected again, GNOME 42 support stays GitHub-only and no further
  attempts are made.

## Consequences

- The connectObject refactor must stay logically identical on both
  branches (AGENTS.md invariant: only extension.js/metadata.json differ).
- Reply drafts live in `docs/upstream/review-replies.md`; post them only
  after the corresponding uploads exist.
- EGO review pages: 76461 (v1), 76462 (v2); future uploads will get new
  version numbers automatically (EGO assigns them by upload order).
