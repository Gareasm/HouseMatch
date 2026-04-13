import { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import TrackCard from './TrackCard';
import Navbar from './Navbar';
import apiFetch from '../api/apiFetch';

const testSongs = [
  { id: 1, title: "Losing It", artist: "FISHER", albumArt: null, spotifyUrl: null, soundcloudUrl: null },
  { id: 2, title: "Take It", artist: "FISHER", albumArt: null, spotifyUrl: null, soundcloudUrl: null },
  { id: 3, title: "Pump The Brakes", artist: "Dom Dolla", albumArt: null, spotifyUrl: null, soundcloudUrl: null },
  { id: 4, title: "San Frandisco", artist: "Dom Dolla", albumArt: null, spotifyUrl: null, soundcloudUrl: null },
  { id: 5, title: "Sad Money", artist: "Dom Dolla", albumArt: null, spotifyUrl: null, soundcloudUrl: null },
  { id: 6, title: "Rumble", artist: "Skrillex & Fred Again", albumArt: null, spotifyUrl: null, soundcloudUrl: null },
  { id: 7, title: "Jungle", artist: "Fred Again", albumArt: null, spotifyUrl: null, soundcloudUrl: null },
  { id: 8, title: "Turn Me Up", artist: "Chris Lake", albumArt: null, spotifyUrl: null, soundcloudUrl: null },
];

function SwipeCard({ song, onLike, onPass, isTop }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const passOpacity = useTransform(x, [-100, 0], [1, 0]);

  return (
    <motion.div
      style={{
        x,
        rotate,
        opacity,
        position: 'absolute',
        cursor: isTop ? 'grab' : 'default',
        userSelect: 'none',
      }}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={(e, { offset, velocity }) => {
        if (offset.x > 100 || velocity.x > 500) onLike();
        else if (offset.x < -100 || velocity.x < -500) onPass();
      }}
      whileTap={{ cursor: 'grabbing' }}
    >
      <motion.div style={{
        position: 'absolute', top: 16, left: 16, zIndex: 10,
        background: '#22c55e', color: '#fff', fontWeight: 700,
        fontSize: 18, padding: '4px 12px', borderRadius: 8,
        opacity: likeOpacity, pointerEvents: 'none',
      }}>
        LIKE
      </motion.div>

      <motion.div style={{
        position: 'absolute', top: 16, right: 16, zIndex: 10,
        background: '#ef4444', color: '#fff', fontWeight: 700,
        fontSize: 18, padding: '4px 12px', borderRadius: 8,
        opacity: passOpacity, pointerEvents: 'none',
      }}>
        PASS
      </motion.div>

      <TrackCard
        title={song.title}
        artist={song.artist}
        albumArt={song.albumArt}
        spotifyUrl={song.spotifyUrl}
        soundcloudUrl={song.soundcloudUrl}
      />
    </motion.div>
  );
}

function Feed() {
  const [songs, setSongs] = useState([]);
  const [index, setIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const response = await apiFetch('http://localhost:5000/api/songs');
        if (!response) return;
        const data = await response.json();
        if (response.ok && Array.isArray(data) && data.length > 0) {
          setSongs(data.map((song, i) => ({
            id: song._id || i,
            title: song.title,
            artist: song.artist || '',
            albumArt: song.albumArt || null,
            spotifyUrl: song.spotifyUrl || null,
            soundcloudUrl: song.soundcloudUrl || null,
          })));
        } else {
          setSongs(testSongs);
        }
      } catch {
        setSongs(testSongs);
      }
    };
    fetchSongs();
  }, []);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setIndex(0);
  };

  const handleVote = async (voteType) => {
    try {
      const song = filteredSongs[index];
      if (!song) return;

      const token = localStorage.getItem("token");

      await fetch(`http://localhost:5000/api/songs/${song.id}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ vote_type: voteType }),
      });

      setIndex(i => i + 1);
    } catch (err) {
      console.error("Vote failed:", err);
    }
  };

  const filteredSongs = songs.filter(song =>
    song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const remaining = filteredSongs.slice(index, index + 3);
  const done = index >= filteredSongs.length && filteredSongs.length > 0;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: '#0a0a0a',
      gap: 24,
      paddingTop: 64,
    }}>
      <Navbar />
      <h2 style={{ margin: 0, fontFamily: 'sans-serif', color: '#e0e0e0' }}>Discover</h2>

      <input
        type="text"
        placeholder="Search by title or artist..."
        value={searchQuery}
        onChange={handleSearchChange}
        style={{
          padding: '8px 16px',
          borderRadius: 8,
          border: '1px solid #333',
          background: '#1a1a1a',
          color: '#e0e0e0',
          fontSize: 14,
          width: 260,
          outline: 'none',
        }}
      />

      {done ? (
        <div style={{ fontFamily: 'sans-serif', textAlign: 'center' }}>
          <p>You've seen everything for now.</p>
          <button onClick={() => setIndex(0)} style={{ padding: '8px 20px', cursor: 'pointer' }}>
            Start over
          </button>
        </div>
      ) : (
        <div style={{ position: 'relative', width: 280, height: 380 }}>
          {[...remaining].reverse().map((song, i) => {
            const isTop = i === remaining.length - 1;
            return (
              <SwipeCard
                key={song.id}
                song={song}
                isTop={isTop}
                onLike={() => handleVote("like")}
                onPass={() => handleVote("dislike")}
              />
            );
          })}
        </div>
      )}

      {!done && (
        <div style={{ display: 'flex', gap: 32 }}>
          <button onClick={() => handleVote("dislike")}>Pass</button>
          <button onClick={() => handleVote("like")}>Like</button>
        </div>
      )}

      <p style={{ fontFamily: 'sans-serif', fontSize: 13, color: '#666' }}>
        {filteredSongs.length > 0 ? `${Math.min(index + 1, filteredSongs.length)} / ${filteredSongs.length}` : ''}
      </p>
    </div>
  );
}

const btnStyle = () => ({
  background: 'transparent',
  color: '#333',
  border: '1px solid #ccc',
  borderRadius: 8,
  padding: '8px 24px',
  fontSize: 14,
  cursor: 'pointer',
});

export default Feed;