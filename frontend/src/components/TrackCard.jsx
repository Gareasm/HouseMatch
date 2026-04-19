// TrackCard — minimal debug version
// Props:
//   title         (string) — track title
//   artist        (string) — artist name
//   albumArt      (string) — image URL (default: null, shows grey box)
//   previewUrl    (string) — preview link (optional)
//   soundcloudUrl (string) — SoundCloud link (optional)

import { useState, useRef } from 'react';

export default function TrackCard({
	title = 'Unknown Track',
	artist = 'Unknown Artist',
	albumArt = null,
	spotifyUrl = null,
	soundcloudUrl = null,
	previewUrl = null,
}) {
	const audioRef = useRef(null);
	const [isPlaying, setIsPlaying] = useState(false);

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
				border: '1px solid #ddd',
				borderRadius: 12,
				overflow: 'hidden',
				fontFamily: 'sans-serif',
				background: '#fff',
			}}
		>
			{albumArt ? (
				<img
					src={albumArt}
					alt="album cover"
					style={{ width: '100%', height: 280, objectFit: 'cover', display: 'block' }}
				/>
			) : (
				<div style={{ width: '100%', height: 280, background: '#d9d9d9' }} />
			)}

			<div style={{ padding: '12px 14px 14px' }}>
				<p style={{ margin: '0 0 4px', fontWeight: 600, fontSize: 15 }}>{title}</p>
				<p style={{ margin: '0 0 12px', fontSize: 13, color: '#666' }}>{artist}</p>

				<div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
					{previewUrl && (
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