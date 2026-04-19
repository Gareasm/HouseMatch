const axios = require('axios');

const SC_API_BASE = 'https://api.soundcloud.com';
const SC_TOKEN_URL = 'https://api.soundcloud.com/oauth2/token';

let cachedToken = null;
let cachedTokenExpiresAt = 0;

async function getSoundCloudToken() {
	if (cachedToken && Date.now() < cachedTokenExpiresAt) {
		return cachedToken;
	}

	const response = await axios.post(
		SC_TOKEN_URL,
		new URLSearchParams({
			grant_type: 'client_credentials',
			client_id: process.env.SOUNDCLOUD_CLIENT_ID,
			client_secret: process.env.SOUNDCLOUD_CLIENT_SECRET,
		}).toString(),
		{
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Accept': 'application/json',
			},
		}
	);

	const data = response.data;

	cachedToken = data.access_token;
	cachedTokenExpiresAt = Date.now() + ((data.expires_in || 3600) - 60) * 1000;

	return cachedToken;
}

async function resolveTrack(url) {
	const token = await getSoundCloudToken();
	const cleanUrl = url.split('?')[0];

	const resolveRes = await axios.get(`${SC_API_BASE}/resolve`, {
		params: { url: cleanUrl },
		headers: {
			Authorization: `OAuth ${token}`,
			Accept: 'application/json',
		},
		maxRedirects: 0,
		validateStatus: (status) => status === 302,
	});

	const location = resolveRes.headers.location;

	if (!location) {
		throw new Error('Resolve did not return a redirect location');
	}

	const trackRes = await axios.get(location, {
		headers: {
			Authorization: `OAuth ${token}`,
			Accept: 'application/json',
		},
	});

	const track = trackRes.data;

	let previewUrl = null;

	const preview = track.media?.transcodings?.find((t) =>
		t?.preset?.toLowerCase().includes('preview')
	);

	if (preview?.url) {
		const streamRes = await axios.get(preview.url, {
			headers: {
				Authorization: `OAuth ${token}`,
				Accept: 'application/json',
			},
		});

		previewUrl = streamRes.data?.url || null;
	} else if (track.stream_url) {
		const streamRes = await axios.get(track.stream_url, {
			headers: {
				Authorization: `OAuth ${token}`,
				Accept: 'application/json',
			},
		});

		previewUrl = streamRes.data?.url || null;
	}

	return {
		soundcloudTrackId: track.id || null,
		artworkUrl: (track.artwork_url || track.user?.avatar_url || null)
            ?.replace('-large', '-t500x500'),
		permalinkUrl: track.permalink_url || cleanUrl,
		previewUrl,
		streamAccess: track.access || null,
		genre: track.genre || null,
	};
}

module.exports = {
	getSoundCloudToken,
	resolveTrack,
};