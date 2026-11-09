/**
 * Hover state that survives lifting a finger. With a mouse, `leave` clears the
 * hover at once. With touch, the browser reports a leave as soon as the finger
 * lifts, which would hide a tooltip before it can be read; instead the hover
 * stays until the next tap outside `root()`. A touch that turns into a scroll
 * (`pointercancel`) still clears it.
 *
 * Wire `down` to `pointerdown`, `cancel` to `pointercancel` and `leave` to
 * `pointerleave`; call `destroy` when the component goes away.
 */
export function touchHold(root: () => Element | null | undefined, clear: (event: PointerEvent) => void) {
	let stop: (() => void) | undefined;
	let cancelled = false;

	function release() {
		stop?.();
		stop = undefined;
	}

	return {
		down() {
			cancelled = false;
		},
		cancel() {
			cancelled = true;
		},
		leave(event: PointerEvent) {
			release();
			if (event.pointerType === 'touch' && !cancelled && typeof document !== 'undefined') {
				const outside = (e: PointerEvent) => {
					const el = root();
					if (el && e.target instanceof Node && el.contains(e.target)) return;
					release();
					clear(e);
				};
				// Capture, so the clear runs before a handler on the tapped element sets a new hover.
				document.addEventListener('pointerdown', outside, true);
				stop = () => document.removeEventListener('pointerdown', outside, true);
				return;
			}
			cancelled = false;
			clear(event);
		},
		destroy: release
	};
}
