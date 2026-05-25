// Spotify API Integration

// We removed the Client ID and Secret from here because it's public!
// Instead, we will call our secure Supabase Edge Function to do it for us.

const SUPABASE_APP_URL = 'https://dqykqsoxympaglnzxzpl.supabase.co'; // i.e. https://xyz.supabase.co
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxeWtxc294eW1wYWdsbnp4enBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2NjIxODksImV4cCI6MjA5NTIzODE4OX0.fC4JTKG2TrDjerOjAAU4MLI9zRDWUm6KfrqeUUlZXC8';

async function searchSpotifyTracks(query) {
    if (!query) return [];

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
        
        if (!response.ok) {
            console.warn("Edge Function failed. Ensure it is deployed to Supabase.");
            throw new Error('Edge function failed - is it deployed?');
        }
        
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