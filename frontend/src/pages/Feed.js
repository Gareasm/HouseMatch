import React, { useState, useEffect } from 'react';
import {Link} from 'react-router-dom';

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

function Feed() {
  const [searchTerm, setSearchTerm] = useState('');
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/songs');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch songs');
        }

        if (Array.isArray(data) && data.length > 0) {
          const normalizedSongs = data.map((song, index) => ({
            id: song._id || song.id || index + 1,
            title: song.title,
            soundcloudUrl: song.soundcloudUrl || '',
            likes: song.likes ?? 0,
            dislikes: song.dislikes ?? 0,
            totalVotes: song.totalVotes ?? 0,
          }));

          setSongs(normalizedSongs);
        } else {
          setSongs(testSongs);
        }
      } catch (err) {
        setError('Using test songs right now.');
        setSongs(testSongs);
      } finally {
        setLoading(false);
      }
    };

    fetchSongs();
  }, []);

   const filteredSongs = songs.filter(song =>
    song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    song.artist.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h1>Feed</h1>
      <input
        type="text"
        placeholder="Search by song or artist..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {loading && <p>Loading songs...</p>}
      {error && <p>{error}</p>}
      <ul>
        {filteredSongs.map(song => (
          <li key={song.id}>
            <Link to={`/songs/${song.id}`}>
              {song.title} - {song.artist}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Feed;