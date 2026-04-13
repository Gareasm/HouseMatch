import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import './Leaderboard.css';

// Retrive actual songs 

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
  []
);

  return (
    <div className="lb-container">
      <Navbar />
      <div className="lb-content">
        <h1 className="lb-title">Leaderboard</h1>
        <p className="lb-subtitle">Top tracks ranked by likes</p>

        <div className="lb-list">
          {songs.map((song, i) => (
            //Credit to W3Schools HTML Tutorial 
            <div key={song.id} className={`lb-row ${i < 3 ? 'lb-row--top' : ''}`}>
              <span className="lb-rank">
                {i < 3 ? medals[i] : `#${i + 1}`}
              </span>
              <div className="lb-track">
                <span className="lb-track-title">{song.title}</span>
                <span className="lb-track-artist">{song.artist}</span>
              </div>
              <span className="lb-likes">{song.likes} likes</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Leaderboard;
