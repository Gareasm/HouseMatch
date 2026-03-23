import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

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
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSong = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/songs/${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch song');
        }

        setSong({
          id: data._id || data.id,
          title: data.title,
          artist: data.artist,
          soundcloudUrl: data.soundcloudUrl || '',
          likes: data.likes ?? 0,
          dislikes: data.dislikes ?? 0,
          totalVotes: data.totalVotes ?? 0,
        });
      } catch (err) {
        const fallbackSong = testSongs.find(
          (song) => String(song.id) === String(id)
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

  if (loading) {
    return <p>Loading song...</p>;
  }

  if (!song) {
    return (
      <div>
        <p>{error}</p>
        <Link to="/feed">Back to Feed</Link>
      </div>
    );
  }

  return (
    <div>
      <h1>{song.title}</h1>
      <p><strong>Artist:</strong> {song.artist}</p>

      {song.likes !== undefined && (
        <p><strong>Likes:</strong> {song.likes}</p>
      )}
      {song.dislikes !== undefined && (
        <p><strong>Dislikes:</strong> {song.dislikes}</p>
      )}
      {song.totalVotes !== undefined && (
        <p><strong>Total Votes:</strong> {song.totalVotes}</p>
      )}

      {song.soundcloudUrl && (
        <p>
          <a href={song.soundcloudUrl} target="_blank" rel="noreferrer">
            Open SoundCloud
          </a>
        </p>
      )}

      {error && <p>{error}</p>}

      <Link to="/feed">Back to Feed</Link>
    </div>
  );
}

export default SongDetail;