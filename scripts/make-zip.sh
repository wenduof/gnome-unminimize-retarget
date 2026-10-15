#!/usr/bin/env bash
# Build the extensions.gnome.org upload zip: extension code only.
# Run from the branch you want to publish (main for GNOME 45+, gnome-42 for 42).
set -eu
uuid=$(python3 -c "import json;print(json.load(open('metadata.json'))['uuid'])")
out="unminimize-retarget-$(git rev-parse --short HEAD).zip"
rm -f "$out"
zip -j "$out" extension.js metadata.json LICENSE
echo "wrote $out (uuid: $uuid, branch: $(git branch --show-current))"
