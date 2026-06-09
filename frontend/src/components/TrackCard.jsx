// TrackCard
// Props:
//   title         (string)  — track title
//   artist        (string)  — artist name
//   albumArt      (string)  — image URL (default: null, shows grey box)
//   previewUrl    (string)  — preview link (optional, fallback playback)
//   soundcloudUrl (string)  — SoundCloud link (optional)
//   isActive      (boolean) — top/active card; when true and a SoundCloud URL
//                             exists, embeds the SoundCloud player (full track)

import { useState, useRef } from 'react';
import SoundCloudPlayer from './SoundCloudPlayer';

// Shared media height so the player, artwork, and placeholder are all the same
// size — otherwise the active (player) card is taller than the cards behind it
// and overflows the swipe stack.
const MEDIA_HEIGHT = 280;
// Fixed total card height + single-line (ellipsised) text keeps every card the
// same size regardless of title length, so cards never overflow the swipe stack
// onto the Pass/Like buttons.
const CARD_HEIGHT = 390;

export default function TrackCard({
	title = 'Unknown Track',
	artist = 'Unknown Artist',
	albumArt = null,
	spotifyUrl = null,
	soundcloudUrl = null,
	previewUrl = null,
	isActive = false,
}) {
	const audioRef = useRef(null);
	const [isPlaying, setIsPlaying] = useState(false);
	// Real playability comes from the widget at runtime, not stale DB metadata.
	const [available, setAvailable] = useState(true);

	const linkUrl = spotifyUrl || soundcloudUrl;
	const linkLabel = spotifyUrl ? 'Open in Spotify' : soundcloudUrl ? 'Open in SoundCloud' : null;

	const handlePreview = async () => {
		if (!previewUrl) return;

		try {
			if (!audioRef.current) {
				audioRef.current = new Audio(previewUrl);

				audioRef.current.addEventListener('ended', () => setIsPlaying(false));
				audioRef.current.addEventListener('pause', () => setIsPlaying(false));
				audioRef.current.addEventListener('play', () => setIsPlaying(true));
			}

			if (audioRef.current.paused) {
				await audioRef.current.play();
			} else {
				audioRef.current.pause();
			}
		} catch (err) {
			console.error('Preview playback failed:', err);
		}
	};

	return (
		<div
			style={{
				width: 280,
				height: CARD_HEIGHT,
				display: 'flex',
				flexDirection: 'column',
				border: '1px solid #ddd',
				borderRadius: 12,
				overflow: 'hidden',
				fontFamily: 'sans-serif',
				background: '#fff',
			}}
		>
			<div style={{ position: 'relative', flexShrink: 0, height: MEDIA_HEIGHT }}>
				{soundcloudUrl && isActive ? (
					<SoundCloudPlayer
						trackUrl={soundcloudUrl}
						isActive={isActive}
						height={MEDIA_HEIGHT}
						onAvailability={setAvailable}
					/>
				) : albumArt ? (
					<img
						src={albumArt}
						alt="album cover"
						style={{ width: '100%', height: MEDIA_HEIGHT, objectFit: 'cover', display: 'block' }}
					/>
				) : (
					<div style={{ width: '100%', height: MEDIA_HEIGHT, background: '#d9d9d9' }} />
				)}

				{soundcloudUrl && isActive && !available && (
					<div
						style={{
							position: 'absolute',
							inset: 0,
							zIndex: 5,
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							justifyContent: 'center',
							gap: 6,
							padding: 16,
							textAlign: 'center',
							background: 'rgba(10, 10, 10, 0.86)',
						}}
					>
						<span style={{ color: '#e2d9f3', fontSize: 14, fontWeight: 600 }}>
							Not available to play here
						</span>
						<span style={{ color: '#a78bbf', fontSize: 12 }}>
							Open in SoundCloud below to listen
						</span>
					</div>
				)}
			</div>

			<div style={{ padding: '12px 14px 14px' }}>
				<p style={{ margin: '0 0 4px', fontWeight: 600, fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</p>
				<p style={{ margin: '0 0 12px', fontSize: 13, color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{artist}</p>

				<div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
					{previewUrl && !soundcloudUrl && (
						<button
							type="button"
							onClick={handlePreview}
							style={{
								fontSize: 12,
								color: '#1a1a1a',
								border: '1px solid #ccc',
								borderRadius: 6,
								padding: '5px 10px',
								background: '#fff',
								cursor: 'pointer',
							}}
						>
							{isPlaying ? 'Pause Preview' : 'Play Preview'}
						</button>
					)}

					{linkUrl && (
						<a
							href={linkUrl}
							target="_blank"
							rel="noopener noreferrer"
							style={{
								display: 'inline-block',
								fontSize: 12,
								color: '#1a1a1a',
								border: '1px solid #ccc',
								borderRadius: 6,
								padding: '5px 10px',
								textDecoration: 'none',
							}}
						>
							{linkLabel} ↗
						</a>
					)}
				</div>
			</div>
		</div>
	);
}