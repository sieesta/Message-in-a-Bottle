// Spotify API Integration

const SPOTIFY_CLIENT_ID = 'YOUR_SPOTIFY_CLIENT_ID';
const SPOTIFY_CLIENT_SECRET = 'YOUR_SPOTIFY_CLIENT_SECRET';
let spotifyAccessToken = '';

async function getSpotifyToken() {
    if (spotifyAccessToken) return spotifyAccessToken;
    
    if (SPOTIFY_CLIENT_ID === 'YOUR_SPOTIFY_CLIENT_ID') {
        console.warn("Spotify Client ID not set. Using mock data for demo.");
        return null; // Signals to use mock data
    }

    try {
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + btoa(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET)
            },
            body: 'grant_type=client_credentials'
        });
        const data = await response.json();
        spotifyAccessToken = data.access_token;
        return spotifyAccessToken;
    } catch (e) {
        console.error("Error fetching Spotify token", e);
        return null;
    }
}

async function searchSpotifyTracks(query) {
    if (!query) return [];
    
    const token = await getSpotifyToken();
    
    // Use Mock Data if no token successfully fetched (for demo purposes)
    if (!token) {
        const mockDb = [
            { id: '75JFxkI2RXiU7L9VXzMkle', name: 'The One That Got Away', artists: [{name: 'Katy Perry'}], album: {images: [{url: 'https://i.scdn.co/image/ab67616d000048518aeda0abde1914eb13df420a'}, {url: 'https://i.scdn.co/image/ab67616d000048518aeda0abde1914eb13df420a'}]} },
            { id: '1', name: 'You Are the Right One', artists: [{name: 'Sports'}], album: {images: [{url: 'https://via.placeholder.com/50'}, {url: 'https://via.placeholder.com/50'}]} },
            { id: '2', name: 'Your Song', artists: [{name: 'Parokya Ni Edgar'}], album: {images: [{url: 'https://via.placeholder.com/50'}, {url: 'https://via.placeholder.com/50'}]} },
            { id: '3', name: 'Here, There And Everywhere - 2022 Mix', artists: [{name: 'The Beatles'}], album: {images: [{url: 'https://via.placeholder.com/50'}, {url: 'https://via.placeholder.com/50'}]} }
        ];
        return mockDb.filter(t => t.name.toLowerCase().includes(query.toLowerCase()));
    }

    try {
        const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`, {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });
        const data = await response.json();
        return data.tracks.items;
    } catch (e) {
        console.error("Error searching Spotify", e);
        return [];
    }
}

function getSpotifyEmbedIframe(spotifyUrl) {
    try {
        const url = new URL(spotifyUrl);
        if (url.hostname === 'open.spotify.com' && url.pathname.startsWith('/track/')) {
            const trackId = url.pathname.split('/')[2];
            return `
                <iframe 
                    style="border-radius:12px" 
                    src="https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0" 
                    width="100%" 
                    height="152" 
                    frameBorder="0" 
                    allowfullscreen="" 
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                    loading="lazy">
                </iframe>
            `;
        }
    } catch (e) {
        console.error("Invalid Spotify URL", e);
    }
    return '';
}