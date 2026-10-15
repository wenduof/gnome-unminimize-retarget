#!/usr/bin/env bash
# Diagnose the unminimize offset: poll X geometry + WM_STATE for the given
# window while the user minimizes/restores it via titlebar button and dock.
#
# Usage: ./measure.sh <window-id> [seconds]
#   window-id: from `xprop -root _NET_CLIENT_LIST` (WM_CLASS via xprop -id)
#
# Interpretation: a Chromium/Electron window shows a geometry change
# ~25-50 ms after each "window state:" transition; GTK windows do not.
set -u
id="${1:?usage: measure.sh <window-id> [seconds]}"
dur="${2:-60}"
prev=""
end=$((SECONDS + dur))
while [ $SECONDS -lt $end ]; do
    g=$(xwininfo -id "$id" 2>/dev/null |
        grep -E "Absolute upper-left|Width:|Height:|Map State" | tr -s ' \n' ' ')
    s=$(xprop -id "$id" WM_STATE 2>/dev/null | grep -oE "window state: \w+")
    cur="$g | $s"
    if [ "$cur" != "$prev" ]; then
        printf '%s %s\n' "$(date +%s.%N | cut -c1-14)" "$cur"
        prev="$cur"
    fi
done
