// SoundCloudPlayer — embedded SoundCloud Widget player.
// Plays the full track (for embeddable songs) and auto-plays when the card is active.
// Props:
//   trackUrl       (string)   — public SoundCloud permalink URL
//   isActive       (boolean)  — whether this card is the top/active card (controls play/pause)
//   height         (number)   — iframe height in px (default 300)
//   onAvailability (function) — called with the track's real playability as the
//                               widget reports it: false on ERROR or a non-playable
//                               sound, true once it actually plays. Lets the card
//                               show an accurate "not available" state instead of
//                               trusting stale seed-time metadata.

import { useEffect, useRef } from 'react';

// Load the SoundCloud Widget API once, shared across all player instances.
let widgetApiPromise = null;
function loadWidgetApi() {
	if (window.SC && window.SC.Widget) return Promise.resolve();
	if (widgetApiPromise) return widgetApiPromise;

	widgetApiPromise = new Promise((resolve, reject) => {
		const script = document.createElement('script');
		script.src = 'https://w.soundcloud.com/player/api.js';
		script.onload = resolve;
		script.onerror = reject;
		document.body.appendChild(script);
	});

	return widgetApiPromise;
}

export default function SoundCloudPlayer({ trackUrl, isActive, height = 300, onAvailability }) {
	const iframeRef = useRef(null);
	const widgetRef = useRef(null);
	const availabilityRef = useRef(onAvailability);
	availabilityRef.current = onAvailability;

	const src =
		'https://w.soundcloud.com/player/?url=' +
		encodeURIComponent(trackUrl) +
		'&color=%237c3aed&auto_play=false&visual=true&hide_related=true' +
		'&show_comments=false&show_reposts=false&show_user=true&download=false';

	// Bind the widget when the track changes; play on READY if active. Pause on cleanup.
	useEffect(() => {
		let cancelled = false;

		const report = (ok) => { if (!cancelled && availabilityRef.current) availabilityRef.current(ok); };

		loadWidgetApi()
			.then(() => {
				if (cancelled || !iframeRef.current || !window.SC) return;
				const widget = window.SC.Widget(iframeRef.current);
				const Events = window.SC.Widget.Events;
				widgetRef.current = widget;

				widget.bind(Events.READY, () => {
					if (cancelled) return;
					if (isActive) {
						try { widget.play(); } catch {}
					}
					// Ask the widget whether this specific track can actually play here.
					try {
						widget.getCurrentSound((sound) => {
							if (sound && sound.playable === false) report(false);
						});
					} catch {}
				});

				// Strong signals override anything stale: it errored → not available;
				// it started playing → available.
				widget.bind(Events.ERROR, () => report(false));
				widget.bind(Events.PLAY, () => report(true));
			})
			.catch(() => {});

		return () => {
			cancelled = true;
			try { widgetRef.current && widgetRef.current.pause(); } catch {}
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [trackUrl]);

	// Play/pause when active state toggles (e.g. card becomes top, or is swiped away).
	useEffect(() => {
		if (!widgetRef.current) return;
		try {
			if (isActive) widgetRef.current.play();
			else widgetRef.current.pause();
		} catch {}
	}, [isActive]);

	return (
		<iframe
			ref={iframeRef}
			title="SoundCloud player"
			width="100%"
			height={height}
			frameBorder="0"
			scrolling="no"
			allow="autoplay"
			src={src}
			style={{ display: 'block', border: 'none' }}
		/>
	);
}
