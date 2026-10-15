const {GLib, Clutter} = imports.gi;
const Main = imports.ui.main;

// Keep in sync with windowManager.js MINIMIZE_WINDOW_ANIMATION_TIME/MODE
const ANIM_TIME_MS = 400;
const ANIM_MODE = Clutter.AnimationMode.EASE_OUT_EXPO;

class UnminimizeRetargetExtension {
    enable() {
        this._watched = new Map(); // MetaWindow -> [positionId, sizeId, unmanagedId]
        this._starts = new Map();  // actor -> monotonic usec of unminimize start

        // Connected after WindowManager's own handler, so the original
        // animation is already set up when this runs.
        this._wmConn = global.window_manager.connect('unminimize', (shellwm, actor) => {
            this._starts.set(actor, GLib.get_monotonic_time());
            this._watchWindow(actor.get_meta_window());
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
        }
    }

    _retarget(win) {
        const actor = win.get_compositor_private();
        if (!actor)
            return;
        // Only act while the unminimize position/scale tween is running
        // and only for the non-fade (icon-targeted) animation path.
        if (!Main.wm._unminimizing.has(actor) || win.is_monitor_sized())
            return;

        const start = this._starts.get(actor);
        const elapsed = start ? (GLib.get_monotonic_time() - start) / 1000 : 0;
        const remaining = Math.max(ANIM_TIME_MS - elapsed, 50);
        const rect = win.get_buffer_rect();

        actor.ease({
            x: rect.x,
            y: rect.y,
            duration: remaining,
            mode: ANIM_MODE,
        });
    }
}

function init() {
    return new UnminimizeRetargetExtension();
}
