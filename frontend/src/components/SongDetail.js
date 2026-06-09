import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from './Navbar';

const testSongs = [
  { id: 1, title: "Losing It", artist: "FISHER" },
  { id: 2, title: "Take It", artist: "FISHER" },
  { id: 3, title: "Pump The Brakes", artist: "Dom Dolla" },
  { id: 4, title: "San Frandisco", artist: "Dom Dolla" },
  { id: 5, title: "Sad Money", artist: "Dom Dolla" },
  { id: 6, title: "Rumble", artist: "Skrillex & Fred Again" },
  { id: 7, title: "Jungle", artist: "Fred Again" },
  { id: 8, title: "Turn Me Up", artist: "Chris Lake" },
];

function SongDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSong = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/songs/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch song');
        }

        setSong({
          id: data._id || data.id,
          title: data.title,
          artist: data.artist,
          artworkUrl: data.artworkUrl || null,
          soundcloudUrl: data.permalinkUrl || data.soundcloudUrl || '',
          likes: data.likes ?? 0,
        });
      } catch (err) {
        const fallbackSong = testSongs.find(
          (s) => String(s.id) === String(id)
        );

        if (fallbackSong) {
          setSong(fallbackSong);
          setError('Using test song data right now.');
        } else {
          setError('Song not found.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSong();
  }, [id]);

  return (
    <div style={styles.page}>
      <Navbar />

      {loading ? (
        <p style={styles.muted}>Loading song...</p>
      ) : !song ? (
        <div style={styles.card}>
          <p style={styles.muted}>{error || 'Song not found.'}</p>
          <button type="button" style={styles.backBtn} onClick={() => navigate(-1)}>
            ← Back
          </button>
        </div>
      ) : (
        <div style={styles.card}>
          {song.artworkUrl ? (
            <img src={song.artworkUrl} alt={`${song.title} artwork`} style={styles.art} />
          ) : (
            <div style={{ ...styles.art, ...styles.artPlaceholder }} />
          )}

          <h1 style={styles.title}>{song.title}</h1>
          <p style={styles.artist}>{song.artist}</p>
          <p style={styles.likes}>♥ {song.likes ?? 0} {(song.likes ?? 0) === 1 ? 'like' : 'likes'}</p>

          {song.soundcloudUrl && (
            <a
              href={song.soundcloudUrl}
              target="_blank"
              rel="noreferrer"
              style={styles.scBtn}
            >
              Open in SoundCloud ↗
            </a>
          )}

          <button type="button" style={styles.backBtn} onClick={() => navigate(-1)}>
            ← Back
          </button>

          {error && <p style={styles.error}>{error}</p>}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#0a0a0a',
    color: '#e0e0e0',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    paddingTop: 64,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 380,
    margin: '2.5rem 1rem',
    background: '#1a1a1a',
    border: '1px solid rgba(168, 85, 247, 0.3)',
    borderRadius: 14,
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  art: {
    width: '100%',
    aspectRatio: '1 / 1',
    objectFit: 'cover',
    borderRadius: 10,
    display: 'block',
  },
  artPlaceholder: { background: '#2a2a2a' },
  title: {
    margin: '1.25rem 0 0.25rem',
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#fff',
  },
  artist: { margin: 0, color: '#b0b0b0', fontSize: '1rem' },
  likes: { margin: '0.75rem 0 1.25rem', color: '#a855f7', fontWeight: 600 },
  scBtn: {
    display: 'inline-block',
    width: '100%',
    background: '#7c3aed',
    color: '#fff',
    border: '1px solid #7c3aed',
    borderRadius: 8,
    padding: '0.7rem 1rem',
    fontSize: 15,
    fontWeight: 600,
    textDecoration: 'none',
    boxSizing: 'border-box',
  },
  backBtn: {
    marginTop: 12,
    background: 'transparent',
    color: '#e2d9f3',
    border: '1px solid rgba(168, 85, 247, 0.4)',
    borderRadius: 8,
    padding: '0.6rem 1rem',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    width: '100%',
  },
  muted: { color: '#b0b0b0', marginTop: '3rem' },
  error: { color: '#ef4444', fontSize: 13, marginTop: '0.75rem' },
};

export default SongDetail;
