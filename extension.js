import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';

import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import {logError} from 'resource:///org/gnome/shell/misc/util.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

// Keep in sync with windowManager.js MINIMIZE_WINDOW_ANIMATION_TIME/MODE
const ANIM_TIME_MS = 400;
const ANIM_MODE = Clutter.AnimationMode.EASE_OUT_EXPO;

export default class UnminimizeRetarget extends Extension {
    enable() {
        this._watched = new Map(); // MetaWindow -> [positionId, sizeId, unmanagedId]
        this._starts = new Map();  // MetaWindow -> monotonic usec of unminimize start

        // Connected after WindowManager's own handler, so the original
        // animation is already set up when this runs.
        this._wmConn = global.window_manager.connect('unminimize', (shellwm, actor) => {
            const win = actor.get_meta_window();
            if (!win)
                return;
            this._starts.set(win, GLib.get_monotonic_time());
            this._watchWindow(win);
        });
    }

    disable() {
        if (this._wmConn) {
            global.window_manager.disconnect(this._wmConn);
            this._wmConn = null;
        }
        for (const [win, ids] of this._watched)
            ids.forEach(id => win.disconnect(id));
        this._watched.clear();
        this._starts.clear();
    }

    _watchWindow(win) {
        if (!win || this._watched.has(win))
            return;
        const positionId = win.connect('position-changed', () => this._retarget(win));
        const sizeId = win.connect('size-changed', () => this._retarget(win));
        const unmanagedId = win.connect('unmanaged', () => this._unwatch(win));
        this._watched.set(win, [positionId, sizeId, unmanagedId]);
    }

    _unwatch(win) {
        const ids = this._watched.get(win);
        if (ids) {
            ids.forEach(id => win.disconnect(id));
            this._watched.delete(win);
            this._starts.delete(win);
        }
    }

    _retarget(win) {
        const actor = win.get_compositor_private();
        if (!actor)
            return;
        try {
            // Only act while the unminimize position/scale tween is running
            // and only for the non-fade (icon-targeted) animation path.
            if (!Main.wm._unminimizing.has(actor) ||
                (win.is_monitor_sized && win.is_monitor_sized()))
                return;

            const start = this._starts.get(win);
            const elapsed = start ? (GLib.get_monotonic_time() - start) / 1000 : 0;
            const remaining = Math.max(ANIM_TIME_MS - elapsed, 50);
            // Affected windows are frameless, so frame rect == buffer rect.
            const rect = win.get_buffer_rect ? win.get_buffer_rect() : win.get_frame_rect();

            actor.ease({
                x: rect.x,
                y: rect.y,
                duration: remaining,
                mode: ANIM_MODE,
            });
        } catch (e) {
            // A future GNOME may drop a private API we rely on. Fail once per
            // window, then degrade quietly to the original animation.
            logError(e, 'Unminimize Retarget: degrading');
            this._unwatch(win);
        }
    }
}
