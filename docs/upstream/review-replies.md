# EGO review replies (post from the review pages, after uploading)

Both reviews are by JustPerfection. Keep replies short; the GNOME 42
rationale stays reversible (fallback: GitHub-only, see ADR 0007). Post
each reply only once the corresponding upload is up.

## v3 upload (main) - fix note

> Uploaded v3 of the main package: it carries the
> `connectObject()`/`disconnectObject()` refactor you asked for, plus a
> fix for a load failure found during real-hardware verification on
> Ubuntu 26.04 / GNOME Shell 50.1 - the previous build imported
> `logError` from `misc/util.js`, which never exported it on 45-51, so
> module evaluation aborted on every supported shell version. It now
> uses gjs's global `logError`; no other behaviour changed.

## Review 76462 - v2 (main 45-50, Active): connectObject

> Thanks - both branches now use `connectObject()`/`disconnectObject()`
> tracked by the extension instance, so cleanup is a single
> `disconnectObject()` call per object. This is in the next upload.

## Review 76461 - v1 (gnome-42, Rejected): "42.9" + old-shell advice

> Thanks for the review - the redundant `42.9` entry is gone
> (`shell-version` is now `["42"]`). On the second point: I have
> resubmitted the branch as a GNOME 42-only package for one reason -
> GNOME 42 is frozen (no ongoing maintenance), and 42.9 is the
> environment where this glitch was originally measured and visually
> verified (Ubuntu 22.04 LTS ships it and is supported until April
> 2027). If you would rather not host old-shell packages for new
> extensions, that is fine - just say so and I will keep GNOME 42 to the
> GitHub branch only.
