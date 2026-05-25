document.addEventListener('DOMContentLoaded', () => {
    const timeInput = document.getElementById('unlockDate');
    const moodSelect = document.getElementById('moodSelect');
    const previewBottle = document.querySelector('.preview-bottle');
    const form = document.getElementById('createBottleForm');
    
    // Spotify Search UI Elements
    const searchInput = document.getElementById('spotifySearchInput');
    const searchResults = document.getElementById('spotifySearchResults');
    const selectedDisplay = document.getElementById('selectedSongDisplay');
    const removeSongBtn = document.getElementById('removeSongBtn');
    const hidTrackUrl = document.getElementById('spotifyTrackUrl');

    // Set minimum date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    timeInput.min = tomorrow.toISOString().split('T')[0];

    // Mood preview logic
    moodSelect.addEventListener('change', (e) => {
        const mood = e.target.value;
        const moodClasses = ['mood-happy', 'mood-calm', 'mood-sad', 'mood-hopeful', 'mood-romantic'];
        
        previewBottle.classList.remove(...moodClasses);
        previewBottle.classList.add(`mood-${mood}`);
    });

    // Spotify Integration Logic
    let searchTimeout;
    
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value;
        clearTimeout(searchTimeout);
        
        if (!query.trim()) {
            searchResults.classList.remove('active');
            return;
        }

        searchTimeout = setTimeout(async () => {
            try {
                const tracks = await searchSpotifyTracks(query);
                renderSearchResults(tracks);
            } catch (err) {
                searchResults.innerHTML = '<div style="padding:1rem; color:red; text-align:center;">Spotify Search failed. Deploy the Edge Function.</div>';
                searchResults.classList.add('active');
            }
        }, 500); // 500ms debounce
    });

    function renderSearchResults(tracks) {
        searchResults.innerHTML = '';
        if (tracks.length === 0) {
            searchResults.innerHTML = '<div style="padding:1rem; color:var(--text-light); text-align:center;">No songs found</div>';
        } else {
            tracks.forEach(track => {
                const imgUrl = track.album.images.length > 0 ? track.album.images[track.album.images.length - 1].url : 'https://via.placeholder.com/40';
                
                const div = document.createElement('div');
                div.className = 'song-result-item';
                div.innerHTML = `
                    <img src="${imgUrl}" alt="Album Art">
                    <div class="song-result-info">
                        <strong>${track.name}</strong>
                        <span>${track.artists.map(a => a.name).join(', ')}</span>
                    </div>
                `;
                
                div.addEventListener('click', () => {
                    selectSong(track, imgUrl);
                });
                
                searchResults.appendChild(div);
            });
        }
        searchResults.classList.add('active');
    }

    function selectSong(track, imgUrl) {
        // Build Spotify URL to store
        const trackUrl = `https://open.spotify.com/track/${track.id}`;
        hidTrackUrl.value = trackUrl;
        
        // Update display card
        document.getElementById('selectedSongImg').src = imgUrl;
        document.getElementById('selectedSongTitle').textContent = track.name;
        document.getElementById('selectedSongArtist').textContent = track.artists.map(a => a.name).join(', ');
        
        // Hide search, show selected card
        searchResults.classList.remove('active');
        searchInput.style.display = 'none';
        selectedDisplay.classList.add('active');
        searchInput.value = '';
    }

    removeSongBtn.addEventListener('click', () => {
        hidTrackUrl.value = '';
        selectedDisplay.classList.remove('active');
        searchInput.style.display = 'block';
    });

    // Close dropdown on outside click
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.spotify-search-container')) {
            searchResults.classList.remove('active');
        }
    });

    // Form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Example check
        console.log("Attached Song URL:", hidTrackUrl.value);
        
        // Supabase DB insert logic would go here
        
        alert('Your message has been sealed and thrown into the sea of time.');
        window.location.href = 'dashboard.html';
    });
});