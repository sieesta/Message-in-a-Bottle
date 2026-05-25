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

    // Set minimum date to today (for testing allowing "Can unlock now")
    const today = new Date();
    timeInput.min = today.toISOString().split('T')[0];

    // Mood preview logic
    moodSelect.addEventListener('change', (e) => {
        const mood = e.target.value;
        const moodClasses = ['mood-happy', 'mood-calm', 'mood-sad', 'mood-hopeful', 'mood-romantic'];
        
        previewBottle.classList.remove(...moodClasses);
        previewBottle.classList.add(`mood-${mood}`);
    });

    // Spotify Integration Logic
    let searchTimeout;
    
    // Default recommendations when clicking empty search box (Using iTunes structure)
    const recommendedTracks = [
        { trackName: 'The One That Got Away', artistName: 'Katy Perry', artworkUrl100: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/91/9f/c6/919fc6d4-d343-4ccb-ed89-8dcb7cc203c9/00602527810486.rgb.jpg/100x100bb.jpg', previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/bf/82/ee/bf82eebe-86eb-6f46-f947-f37fa9b360ae/mzaf_10332822557551066761.plus.aac.p.m4a' },
        { trackName: 'Perfect', artistName: 'Ed Sheeran', artworkUrl100: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/1b/27/e6/1b27e69a-6c1e-f3a7-e9a6-ed99b0c7cf72/190295851286.jpg/100x100bb.jpg', previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/da/51/9d/da519dd1-eeb9-bcad-f55a-e666a7b7a5a8/mzaf_4070001004117765660.plus.aac.p.m4a' },
        { trackName: 'Lover', artistName: 'Taylor Swift', artworkUrl100: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/4e/c9/2a/4ec92a4e-bf2e-f4aa-0d26-cc7b19280cd6/00732053916246.rgb.jpg/100x100bb.jpg', previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/8e/3c/d4/8e3cd41d-d246-86dc-4418-ca04c0ecda73/mzaf_6764506308697380121.plus.aac.p.m4a' },
        { trackName: 'A Thousand Years', artistName: 'Christina Perri', artworkUrl100: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/11/49/b7/1149b71e-dc0f-8cfa-ed89-8d18b2cba726/075679967167.jpg/100x100bb.jpg', previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/80/75/a6/8075a687-ccbb-7d84-c4a0-53bc1be19e78/mzaf_8407421151613045353.plus.aac.p.m4a' }
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
        const filtered = recommendedTracks.filter(t => t.trackName.toLowerCase().includes(query.toLowerCase()));
        if (filtered.length > 0) {
            renderSearchResults(filtered);
        }

        searchTimeout = setTimeout(async () => {
            try {
                const tracks = await searchMusicTracks(query);
                // Filter out results that don't have previews
                const validTracks = tracks.filter(t => t.previewUrl);
                renderSearchResults(validTracks);
            } catch (err) {
                console.error(err);
                searchResults.innerHTML = `<div style="padding:1rem; color:red; font-size:0.85rem; text-align:center;">
                    <b>Music Search API Error.</b><br/>${err.message}
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
                const imgUrl = track.artworkUrl100 || 'https://via.placeholder.com/40';
                
                const div = document.createElement('div');
                div.className = 'song-result-item';
                div.innerHTML = `
                    <img src="${imgUrl}" alt="Album Art">
                    <div class="song-result-info">
                        <strong>${track.trackName}</strong>
                        <span>${track.artistName}</span>
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
        // Store as JSON string so we have all info for the player later
        const trackData = {
            previewUrl: track.previewUrl,
            artworkUrl100: imgUrl,
            trackName: track.trackName,
            artistName: track.artistName
        };
        hidTrackUrl.value = JSON.stringify(trackData);
        
        // Update display card
        document.getElementById('selectedSongImg').src = imgUrl;
        document.getElementById('selectedSongTitle').textContent = track.trackName;
        document.getElementById('selectedSongArtist').textContent = track.artistName;
        
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
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Sealing...';
        
        try {
            // Check if user is logged in
            const { data: { session } } = await supabaseClient.auth.getSession();
            if (!session) {
                alert("You must be logged in to seal a bottle.");
                window.location.href = 'login.html';
                return;
            }

            const title = document.getElementById('bottleTitle').value;
            const message = document.getElementById('bottleMessage').value;
            const unlockDate = document.getElementById('unlockDate').value;
            const mood = document.getElementById('moodSelect').value;
            const musicData = hidTrackUrl.value; // Our packed JSON string from Apple Music
            
            // Insert into Supabase using the helper function
            const { data, error } = await createBottle(
                session.user.id,
                title,
                message,
                mood,
                unlockDate,
                musicData
            );

            if (error) {
                throw error;
            }
            
            alert('Your message has been sealed and thrown into the sea of time.');
            window.location.href = 'dashboard.html';
        } catch (error) {
            console.error("Error creating bottle:", error);
            alert("Failed to seal the bottle. " + error.message);
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Seal the Memory';
        }
    });
});