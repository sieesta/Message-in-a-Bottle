document.addEventListener('DOMContentLoaded', () => {
    const timeInput = document.getElementById('unlockDate');
    const moodSelect = document.getElementById('moodSelect');
    const customMoodGroup = document.getElementById('customMoodGroup');
    const customMoodInput = document.getElementById('customMood');
    const moodColorInput = document.getElementById('moodColor');
    const previewBottle = document.querySelector('.preview-bottle');
    const previewBottleShape = previewBottle ? previewBottle.querySelector('.bottle-shape') : null;
    const previewBottleGlow = previewBottle ? previewBottle.querySelector('.bottle-glow') : null;
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

    function updatePreviewBottle() {
        if (!previewBottle) {
            return;
        }

        const selectedMood = moodSelect.value;
        const customMood = customMoodInput ? customMoodInput.value.trim() : '';
        const moodColor = moodColorInput && moodColorInput.value ? moodColorInput.value : getPresetMoodColor(selectedMood);
        const bottleGradient = buildBottleGradient(moodColor, 0.65, 0.18);

        previewBottle.style.background = bottleGradient;

        if (previewBottleShape) {
            previewBottleShape.style.background = bottleGradient;
        }

        if (previewBottleGlow) {
            previewBottleGlow.style.background = buildBottleGradient(moodColor, 0.45, 0.08);
            previewBottleGlow.style.opacity = '1';
        }

        previewBottle.dataset.moodLabel = selectedMood === 'custom' ? (customMood || 'Custom mood') : getMoodLabel(selectedMood);
    }

    function syncMoodInputs() {
        const isCustomMood = moodSelect.value === 'custom';

        if (customMoodGroup) {
            customMoodGroup.style.display = isCustomMood ? 'block' : 'none';
        }

        if (customMoodInput) {
            customMoodInput.required = isCustomMood;
        }

        updatePreviewBottle();
    }

    moodSelect.addEventListener('change', syncMoodInputs);
    if (customMoodInput) {
        customMoodInput.addEventListener('input', updatePreviewBottle);
    }
    if (moodColorInput) {
        moodColorInput.addEventListener('input', updatePreviewBottle);
    }
    syncMoodInputs();

    // Spotify Integration Logic
    let searchTimeout;
    
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value;
        clearTimeout(searchTimeout);
        
        if (!query.trim()) {
            searchResults.innerHTML = '';
            searchResults.classList.remove('active');
            return;
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
            const selectedMood = moodSelect.value;
            const customMood = customMoodInput ? customMoodInput.value.trim() : '';
            const mood = selectedMood === 'custom' ? customMood : selectedMood;
            const moodColor = moodColorInput && moodColorInput.value ? moodColorInput.value : getPresetMoodColor(selectedMood);
            const musicData = hidTrackUrl.value;

            if (selectedMood === 'custom' && !mood) {
                alert('Please write your actual mood before sealing the bottle.');
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Seal this Bottle';
                return;
            }
            
            // Insert into Supabase using the helper function
            const { data, error } = await createBottle(
                session.user.id,
                title,
                message,
                mood,
                moodColor,
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