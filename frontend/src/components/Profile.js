import { useEffect, useState } from 'react';
import Navbar from './Navbar';
import './Profile.css';
import apiFetch from '../api/apiFetch';

function Profile() {
  const username = localStorage.getItem('username') || 'User';
  const token = localStorage.getItem('token');

  const [submittedSongs, setSubmittedSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ liked: 0, disliked: 0, submitted: 0 });
  const [likedSongs, setLikedSongs] = useState([]);
  const [likedLoading, setLikedLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/users/me/stats', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setStats(data);
      } catch {
        // silently fail
      }
    };
    fetchStats();
  }, [token]);

  useEffect(() => {
    const fetchLikedSongs = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/users/me/liked-songs', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setLikedSongs(data);
      } catch {
        // silently fail
      } finally {
        setLikedLoading(false);
      }
    };
    fetchLikedSongs();
  }, [token]);

  useEffect(() => {
    const fetchSubmittedSongs = async () => {
      try {
        const response = await apiFetch('http://localhost:5000/api/songs/mine', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response) return;

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch submitted songs.');
        }

        setSubmittedSongs(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error loading submitted songs:', err);
        setError('Could not load your submitted songs.');
      } finally {
        setLoading(false);
      }
    };

    fetchSubmittedSongs();
  }, [token]);

  const hasSubmittedSongs = submittedSongs.length > 0;

  return (
    <>
      <Navbar />
      <div className="profile-container">
        <div className="profile-content">
          <div className="profile-header">
            <div className="profile-avatar">
              {username.charAt(0).toUpperCase()}
            </div>

            <div>
              <h1 className="profile-name">@{username}</h1>
              <p className="profile-meta">Member since 2026 · House music enthusiast</p>
            </div>
          </div>

          <div className="profile-stats">
            <div className="stat-card">
              <span className="stat-number">{stats.submitted}</span>
              <span className="stat-label">Submitted</span>
            </div>

            <div className="stat-card">
              <span className="stat-number">{stats.liked}</span>
              <span className="stat-label">Liked</span>
            </div>

            <div className="stat-card">
              <span className="stat-number">{stats.disliked}</span>
              <span className="stat-label">Passed</span>
            </div>
          </div>

          {loading ? (
            <section className="profile-section">
              <h2 className="profile-section-title">Profile</h2>
              <p className="profile-empty">Loading submitted songs...</p>
            </section>
          ) : error ? (
            <section className="profile-section">
              <h2 className="profile-section-title">Profile</h2>
              <p className="profile-empty">{error}</p>
            </section>
          ) : !hasSubmittedSongs ? (
            <section className="profile-section">
              <h2 className="profile-section-title">Welcome</h2>
              <div className="profile-empty-state">
                <p className="profile-empty-title">No songs submitted yet</p>
                <p className="profile-empty">
                  Your submitted songs will appear here once you upload one.
                </p>
              </div>
            </section>
          ) : (
            <section className="profile-section">
              <h2 className="profile-section-title">Submitted Songs</h2>
              <div className="liked-songs-list">
                {submittedSongs.map((song) => (
                  <div key={song._id} className="liked-song-card">
                    {song.artworkUrl ? (
                      <img
                        src={song.artworkUrl}
                        alt={`${song.title} cover`}
                        className="liked-song-art"
                      />
                    ) : (
                      <div className="liked-song-art liked-song-art-placeholder" />
                    )}

                    <div style={{ flex: 1 }}>
                      <p className="liked-song-title">{song.title}</p>
                      <p className="liked-song-artist">{song.artist}</p>
                    </div>

                    {song.soundcloudUrl && (
                      <a
                        href={song.soundcloudUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="profile-song-link"
                      >
                        Open
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Liked Songs */}
          <section className="profile-section">
            <h2 className="profile-section-title">Liked Songs</h2>
            {likedLoading ? (
              <p className="profile-empty">Loading...</p>
            ) : likedSongs.length === 0 ? (
              <p className="profile-empty">No liked songs yet.</p>
            ) : (
              <div className="liked-songs-list">
                {likedSongs.map(song => (
                  <div key={song._id} className="liked-song-card">
                    <div
                      className="liked-song-art"
                      style={song.artworkUrl ? { backgroundImage: `url(${song.artworkUrl})`, backgroundSize: 'cover' } : {}}
                    />
                    <div style={{ flex: 1 }}>
                      <p className="liked-song-title">{song.title}</p>
                      <p className="liked-song-artist">{song.artist}</p>
                    </div>
                    {(song.soundcloudUrl || song.permalinkUrl) && (
                      <a
                        href={song.permalinkUrl || song.soundcloudUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="profile-song-link"
                      >
                        Open
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>
      </div>
    </>
  );
}

export default Profile;
