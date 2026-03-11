import React, { useState } from 'react';

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

  const filteredSongs = testSongs.filter(song =>
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
      <ul>
        {filteredSongs.map(song => (
          <li key={song.id}>
            {song.title} - {song.artist}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Feed;