const Song = require("../models/Song");
const Vote = require("../models/Vote");
const { resolveTrack } = require("./soundcloud");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Check one song against SoundCloud. Deletes the song and its votes (returns
// true) only when SoundCloud reports the track is gone (404/410 — removed or
// invalid link). Transient failures (rate limit, network, 5xx) leave the song
// in place so a hiccup never wipes a still-valid track.
async function validateAndPruneSong(song) {
  try {
    await resolveTrack(song.soundcloudUrl);
    return false; // resolved fine — keep it
  } catch (err) {
    const status = err.response?.status;
    if (status === 404 || status === 410) {
      await Vote.deleteMany({ song: song._id });
      await Song.findByIdAndDelete(song._id);
      return true;
    }
    return false; // transient — keep it
  }
}

// Re-validate the whole catalog, pruning tracks SoundCloud no longer has.
// Throttled between songs to stay gentle on the SoundCloud API.
async function sweepCatalog({ delayMs } = {}) {
  const perSong =
    delayMs !== undefined
      ? delayMs
      : process.env.SONG_SWEEP_DELAY_MS !== undefined
      ? Number(process.env.SONG_SWEEP_DELAY_MS)
      : 1000;

  const started = Date.now();
  const songs = await Song.find().select("_id title soundcloudUrl");
  console.log(`[song-sweep] starting catalog sweep of ${songs.length} songs`);
  let removed = 0;

  for (const song of songs) {
    try {
      if (await validateAndPruneSong(song)) {
        removed += 1;
        console.log(`[song-sweep] removed gone track: ${song.title} (${song._id})`);
      }
    } catch (err) {
      console.error(`[song-sweep] error checking ${song._id}:`, err.message);
    }
    if (perSong) await sleep(perSong);
  }

  console.log(
    `[song-sweep] done: checked ${songs.length}, removed ${removed}, took ${Math.round(
      (Date.now() - started) / 1000
    )}s`
  );
  return { checked: songs.length, removed };
}

// Schedule the sweep: a first pass shortly after startup, then on a fixed
// interval. Controlled by env:
//   DISABLE_SONG_SWEEP=true          -> turn it off (handy in dev)
//   SONG_SWEEP_INTERVAL_HOURS=24     -> how often to sweep
//   SONG_SWEEP_INITIAL_DELAY_MS=60000-> delay before the first sweep
//   SONG_SWEEP_DELAY_MS=1000         -> throttle between songs
function startSongSweep() {
  if (process.env.DISABLE_SONG_SWEEP === "true") {
    console.log("[song-sweep] disabled via DISABLE_SONG_SWEEP");
    return;
  }

  const hours = Number(process.env.SONG_SWEEP_INTERVAL_HOURS) || 24;
  const intervalMs = hours * 60 * 60 * 1000;
  const initialDelayMs = Number(process.env.SONG_SWEEP_INITIAL_DELAY_MS) || 60 * 1000;

  const run = () =>
    sweepCatalog().catch((e) => console.error("[song-sweep] sweep failed:", e.message));

  setTimeout(run, initialDelayMs);
  setInterval(run, intervalMs);

  console.log(
    `[song-sweep] scheduled every ${hours}h (first run in ${Math.round(initialDelayMs / 1000)}s)`
  );
}

module.exports = { validateAndPruneSong, sweepCatalog, startSongSweep };
