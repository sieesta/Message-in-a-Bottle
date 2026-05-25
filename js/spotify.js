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
                <div class="spotify-floating-player" style="
                    animation: floatPlayer 6s ease-in-out infinite;
                    box-shadow: 0 20px 40px rgba(31, 38, 135, 0.2);
                    border-radius: 16px;
                    border: 1px solid rgba(255, 255, 255, 0.5);
                    background: rgba(255, 255, 255, 0.3);
                    backdrop-filter: blur(12px);
                    padding: 10px;
                    max-width: 450px;
                    margin: 1.5rem auto 0;
                    transition: transform 0.3s ease;
                ">
                    <style>
                        @keyframes floatPlayer {
                            0%, 100% { transform: translateY(0); }
                            50% { transform: translateY(-12px); }
                        }
                        .spotify-floating-player:hover {
                            transform: scale(1.02) !important;
                            background: rgba(255, 255, 255, 0.4);
                        }
                    </style>
                    <iframe 
                        style="border-radius: 12px; display: block;" 
                        src="https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0" 
                        width="100%" 
                        height="152" 
                        frameBorder="0" 
                        allowfullscreen="" 
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                        loading="lazy">
                    </iframe>
                </div>
            `;
        }
    } catch (e) {
        console.error("Invalid Spotify URL", e);
    }
    return '';
}