// Spotify API Integration

// We removed the Client ID and Secret from here because it's public!
// Instead, we will call our secure Supabase Edge Function to do it for us.

const SUPABASE_APP_URL = 'YOUR_SUPABASE_URL'; // i.e. https://xyz.supabase.co
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

async function searchSpotifyTracks(query) {
    if (!query) return [];
    
    // Use Mock Data if you haven't linked Supabase yet (for demo purposes)
    if (SUPABASE_APP_URL === 'YOUR_SUPABASE_URL') {
        const mockDb = [
            { id: '75JFxkI2RXiU7L9VXzMkle', name: 'The One That Got Away', artists: [{name: 'Katy Perry'}], album: {images: [{url: 'https://i.scdn.co/image/ab67616d000048518aeda0abde1914eb13df420a'}, {url: 'https://i.scdn.co/image/ab67616d000048518aeda0abde1914eb13df420a'}]} },
            { id: '1', name: 'You Are the Right One', artists: [{name: 'Sports'}], album: {images: [{url: 'https://via.placeholder.com/50'}, {url: 'https://via.placeholder.com/50'}]} },
            { id: '2', name: 'Your Song', artists: [{name: 'Parokya Ni Edgar'}], album: {images: [{url: 'https://via.placeholder.com/50'}, {url: 'https://via.placeholder.com/50'}]} },
            { id: '3', name: 'Here, There And Everywhere - 2022 Mix', artists: [{name: 'The Beatles'}], album: {images: [{url: 'https://via.placeholder.com/50'}, {url: 'https://via.placeholder.com/50'}]} }
        ];
        return mockDb.filter(t => t.name.toLowerCase().includes(query.toLowerCase()));
    }

    try {
        // Here we hit our Secure Edge Backend!
        const response = await fetch(`${SUPABASE_APP_URL}/functions/v1/spotify-search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}` // Anon key is safe in public
            },
            body: JSON.stringify({ query: query })
        });
        
        if (!response.ok) throw new Error('Edge function failed');
        
        const data = await response.json();
        return data.tracks.items;
    } catch (e) {
        console.error("Error searching Spotify via Secure Edge", e);
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