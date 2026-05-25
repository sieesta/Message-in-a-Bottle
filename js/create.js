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
    
    // Default recommendations when clicking empty search box
    const recommendedTracks = [
        { id: '75JFxkI2RXiU7L9VXzMkle', name: 'The One That Got Away', artists: [{name: 'Katy Perry'}], album: {images: [{url: 'https://i.scdn.co/image/ab67616d000048518aeda0abde1914eb13df420a'}, {url: 'https://i.scdn.co/image/ab67616d000048518aeda0abde1914eb13df420a'}]} },
        { id: '4r6eNCsrZnQWJzzvFh4nlg', name: 'Perfect', artists: [{name: 'Ed Sheeran'}], album: {images: [{url: 'https://i.scdn.co/image/ab67616d00004851b2dd0a5209f874de30e01763'}]} },
        { id: '3uUuGVVtJi0D3WGktoZB74', name: 'Lover', artists: [{name: 'Taylor Swift'}], album: {images: [{url: 'https://i.scdn.co/image/ab67616d00004851e787cffec20aa2a396a61647'}]} },
        { id: '0K9EQqT29Xh7KjTngp2g0p', name: 'A Thousand Years', artists: [{name: 'Christina Perri'}], album: {images: [{url: 'https://i.scdn.co/image/ab67616d00004851cdabdf875aeec95d1cd5fb55'}]} }
    ];

    // Show recommendations when input gets clicked/focused
    searchInput.addEventListener('focus', () => {
        if (!searchInput.value.trim()) {
            renderSearchResults(recommendedTracks);
        } else {
            searchResults.classList.add('active');
        }
    });
    
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value;
        clearTimeout(searchTimeout);
        
        if (!query.trim()) {
            // Revert back to defaults if input is cleared
            renderSearchResults(recommendedTracks);
            return;
        }

        // Instant visual filter for recommendations while they keep typing
        const filtered = recommendedTracks.filter(t => t.name.toLowerCase().includes(query.toLowerCase()));
        if (filtered.length > 0) {
            renderSearchResults(filtered);
        }

        searchTimeout = setTimeout(async () => {
            try {
                const tracks = await searchSpotifyTracks(query);
                if (tracks.length > 0) {
                    renderSearchResults(tracks);
                }
            } catch (err) {
                console.error(err);
                searchResults.innerHTML = `<div style="padding:1rem; color:red; font-size:0.85rem; text-align:center;">
                    <b>Spotify Search failed.</b><br/>${err.message}
                </div>`;
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