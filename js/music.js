// iTunes API Integration

async function searchMusicTracks(query) {
    if (!query) return [];

    try {
        // Search Apple Music/iTunes API - free, no API keys required!
        const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=10`);
        
        if (!response.ok) {
            throw new Error(`iTunes HTTP Error: ${response.status}`);
        }
        
        const data = await response.json();
        return data.results;
    } catch (e) {
        console.error("Error searching iTunes API", e);
        throw e; 
    }
}

function getMusicEmbedPlayer(musicDataStr) {
    if(!musicDataStr) return '';
    try {
        // We will store the track as JSON string: {"previewUrl", "artworkUrl100", "trackName", "artistName"}
        let music;
        if(musicDataStr.startsWith('{')) {
            music = JSON.parse(musicDataStr);
        } else {
            // fallback if it's just a raw audio URL
            music = { previewUrl: musicDataStr, trackName: 'Audio Track', artistName: 'Unknown', artworkUrl100: '' };
        }
        
        const previewUrl = music.previewUrl || musicDataStr;
        
        if (!previewUrl) return '';
        
        return `
            <div style="background: rgba(255, 255, 255, 0.4); backdrop-filter: blur(10px); border-radius: 12px; padding: 15px; display: flex; align-items: center; gap: 15px; border: 1px solid rgba(255,255,255,0.5); margin-top:20px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                ${music.artworkUrl100 ? `<img src="${music.artworkUrl100}" style="width:60px; height:60px; border-radius:8px; object-fit: cover;">` : ''}
                <div style="flex-grow: 1; display:flex; flex-direction:column; justify-content:center;">
                    <div style="font-weight:bold; color:#333;">${music.trackName}</div>
                    <div style="font-size:0.85rem; color:#666; margin-bottom:10px;">${music.artistName}</div>
                    <audio controls autoplay style="width:100%; height:30px; outline:none; background:transparent;">
                        <source src="${previewUrl}" type="audio/mp4">
                        Your browser does not support the audio element.
                    </audio>
                </div>
            </div>
        `;
    } catch (e) {
        console.error("Error creating music player", e);
    }
    return '';
}