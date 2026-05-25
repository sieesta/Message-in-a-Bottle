// Spotify API Integration

// We removed the Client ID and Secret from here because it's public!
// Instead, we will call our secure Supabase Edge Function to do it for us.
// Note: We are reusing SUPABASE_URL and SUPABASE_ANON_KEY from js/supabase.js

async function searchSpotifyTracks(query) {
    if (!query) return [];

    try {
        // Here we hit our Secure Edge Backend!
        const response = await fetch(`${SUPABASE_URL}/functions/v1/spotify-search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}` // Anon key is safe in public
            },
            body: JSON.stringify({ query: query })
        });
        
        if (!response.ok) {
            const errText = await response.text();
            console.warn("Edge Function HTTP Status:", response.status);
            console.warn("Edge Function Error DBG:", errText);
            throw new Error(`[${response.status}] ${errText}`);
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