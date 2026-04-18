import { useState, useEffect, useMemo } from 'react';
import Navbar from './Navbar';
import './Leaderboard.css';

// Retrive actual songs 

const PAGE_SIZE = 20;

const placeholderSongs = [
  //auto generated
  { id: 1, title: "Losing It", artist: "FISHER", likes: 142 },
  { id: 2, title: "Rumble", artist: "Skrillex & Fred Again", likes: 118 },
  { id: 3, title: "San Frandisco", artist: "Dom Dolla", likes: 97 },
  { id: 4, title: "Jungle", artist: "Fred Again", likes: 85 },
  { id: 5, title: "Turn Me Up", artist: "Chris Lake", likes: 74 },
  { id: 6, title: "Pump The Brakes", artist: "Dom Dolla", likes: 61 },
  { id: 7, title: "Sad Money", artist: "Dom Dolla", likes: 53 },
  { id: 8, title: "Take It", artist: "FISHER", likes: 40 },
];

const medals = ['#1', '#2', '#3'];

function Leaderboard() {
  const [songs, setSongs] = useState([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/songs/leaderboard');
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
  []);
  const totalPages = Math.max(1, Math.ceil(songs.length / PAGE_SIZE));

  const currentSongs = useMemo(() => {
    const startIndex = (page - 1) * PAGE_SIZE;
    return songs.slice(startIndex, startIndex + PAGE_SIZE);
  }, [songs, page]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const startIndex = (page - 1) * PAGE_SIZE;

  return (
    <div className="lb-container">
      <Navbar />
      <div className="lb-content">
        <h1 className="lb-title">Leaderboard</h1>
        <p className="lb-subtitle">Top tracks ranked by likes</p>

        <div className="lb-list">
          {currentSongs.map((song, i) => (
            //Credit to W3Schools HTML Tutorial 
            <div key={song._id || song.id} className={`lb-row ${startIndex + i < 3 ? 'lb-row--top' : ''}`}>
              <span className="lb-rank">
                {startIndex + i < 3 ? medals[startIndex + i] : `#${startIndex + i + 1}`}
              </span>
              <div className="lb-track">
                <span className="lb-track-title">{song.title}</span>
                <span className="lb-track-artist">{song.artist}</span>
              </div>
              <span className="lb-likes">{song.likes ?? 0} likes</span>
            </div>
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
