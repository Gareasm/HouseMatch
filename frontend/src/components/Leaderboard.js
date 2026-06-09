import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import './Leaderboard.css';

// Retrive actual songs

const PAGE_SIZE = 20;

const placeholderSongs = [
  //auto generated
  { id: 1, title: "Losing It", artist: "FISHER", likes: 121 },
  { id: 2, title: "Rumble", artist: "Skrillex & Fred Again", likes: 97 },
  { id: 3, title: "San Frandisco", artist: "Dom Dolla", likes: 77 },
  { id: 4, title: "Jungle", artist: "Fred Again", likes: 65 },
  { id: 5, title: "Turn Me Up", artist: "Chris Lake", likes: 55 },
  { id: 6, title: "Pump The Brakes", artist: "Dom Dolla", likes: 44 },
  { id: 7, title: "Sad Money", artist: "Dom Dolla", likes: 36 },
  { id: 8, title: "Take It", artist: "FISHER", likes: 26 },
];

const medals = ['#1', '#2', '#3'];

// Time windows for ranking by likes within the period.
const timeframeOptions = [
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'year', label: 'This Year' },
  { value: 'all', label: 'All Time' },
];

function Leaderboard() {
  const [songs, setSongs] = useState([]);
  const [page, setPage] = useState(1);
  const [timeframe, setTimeframe] = useState('all'); // 'week' | 'month' | 'year' | 'all'

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:5000/api/songs/leaderboard?timeframe=${timeframe}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        //leaderboard call
        const data = await res.json();
        if (res.ok && Array.isArray(data) && data.length > 0) {
          setSongs(data);
        }
        else {
          setSongs(placeholderSongs);
        }
      }
      catch {
        setSongs(placeholderSongs);
      }
    };
    fetchLeaderboard();
  },
  [timeframe]);
  const totalPages = Math.max(1, Math.ceil(songs.length / PAGE_SIZE));

  // Rank purely by like count (highest first).
  const sortedSongs = useMemo(
    () => [...songs].sort((a, b) => (b.likes || 0) - (a.likes || 0)),
    [songs]
  );

  const currentSongs = useMemo(() => {
    const startIndex = (page - 1) * PAGE_SIZE;
    return sortedSongs.slice(startIndex, startIndex + PAGE_SIZE);
  }, [sortedSongs, page]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const startIndex = (page - 1) * PAGE_SIZE;
  const selectedTimeframeLabel = timeframeOptions.find((option) => option.value === timeframe)?.label;

  const handleTimeframeChange = (value) => {
    setTimeframe(value);
    setPage(1); // Reset to first page when timeframe changes
  };

  return (
    <div className="lb-container">
      <Navbar />
      <div className="lb-content">
        <h1 className="lb-title">Leaderboard</h1>
        <p className="lb-subtitle">Top tracks ranked by likes · {selectedTimeframeLabel}</p>

        {/* Timeframe filter */}
        <div className="lb-timeframe" role="tablist" aria-label="Leaderboard timeframe">
          {timeframeOptions.map((option) => (
            <button
              type="button"
              key={option.value}
              role="tab"
              aria-selected={timeframe === option.value}
              className={`lb-timeframe-btn ${timeframe === option.value ? 'lb-timeframe-btn--active' : ''}`}
              onClick={() => handleTimeframeChange(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="lb-list">
          {currentSongs.map((song, i) => (
            //Credit to W3Schools HTML Tutorial
            <Link
              to={`/songs/${song._id || song.id}`}
              key={song._id || song.id}
              className={`lb-row ${startIndex + i < 3 ? 'lb-row--top' : ''}`}
            >
              <span className="lb-rank">
                {startIndex + i < 3 ? medals[startIndex + i] : `#${startIndex + i + 1}`}
              </span>
              <div className="lb-track">
                <span className="lb-track-title">{song.title}</span>
                <span className="lb-track-artist">{song.artist}</span>
              </div>
              <span className="lb-likes">{song.likes ?? 0} {(song.likes ?? 0) === 1 ? 'like' : 'likes'}</span>
            </Link>
          ))}
          {songs.length > PAGE_SIZE && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '12px',
                marginTop: '24px',
              }}
            >
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid #a855f7',
                  background: page === 1 ? '#2a2a2a' : '#7c3aed',
                  color: '#fff',
                  cursor: page === 1 ? 'not-allowed' : 'pointer',
                }}
              >
                Previous
              </button>

              <span style={{ color: '#e2d9f3', fontWeight: 600 }}>
                Page {page} of {totalPages}
              </span>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid #a855f7',
                  background: page === totalPages ? '#2a2a2a' : '#7c3aed',
                  color: '#fff',
                  cursor: page === totalPages ? 'not-allowed' : 'pointer',
                }}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Leaderboard;
