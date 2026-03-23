// TrackCard — minimal debug version
// Props:
//   title         (string) — track title
//   artist        (string) — artist name
//   albumArt      (string) — image URL (default: null, shows grey box)
//   spotifyUrl    (string) — Spotify link (optional)
//   soundcloudUrl (string) — SoundCloud link (optional)

export default function TrackCard({
  title = "Unknown Track",
  artist = "Unknown Artist",
  albumArt = null,
  spotifyUrl = null,
  soundcloudUrl = null,
}) {
  const linkUrl = spotifyUrl || soundcloudUrl;
  const linkLabel = spotifyUrl ? "Open in Spotify" : soundcloudUrl ? "Open in SoundCloud" : null;

  return (
    <div style={{
      width: 280,
      border: "1px solid #ddd",
      borderRadius: 12,
      overflow: "hidden",
      fontFamily: "sans-serif",
      background: "#fff",
    }}>

      {/* Album art */}
      {albumArt ? (
        <img
          src={albumArt}
          alt="album cover"
          style={{ width: "100%", height: 280, objectFit: "cover", display: "block" }}
        />
      ) : (
        <div style={{ width: "100%", height: 280, background: "#d9d9d9" }} />
      )}

      {/* Card body */}
      <div style={{ padding: "12px 14px 14px" }}>
        <p style={{ margin: "0 0 4px", fontWeight: 600, fontSize: 15 }}>{title}</p>
        <p style={{ margin: "0 0 12px", fontSize: 13, color: "#666" }}>{artist}</p>
        {linkUrl && (
          <a
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              fontSize: 12,
              color: "#1a1a1a",
              border: "1px solid #ccc",
              borderRadius: 6,
              padding: "5px 10px",
              textDecoration: "none",
            }}
          >
            {linkLabel} ↗
          </a>
        )}
      </div>

    </div>
  );
}
