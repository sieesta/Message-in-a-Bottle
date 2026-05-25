// Dashboard specific logic
document.addEventListener('DOMContentLoaded', async () => {
    const logoutBtn = document.getElementById('logoutBtn');
    
    // Check if user is logged in
    const { data: { session } } = await supabaseClient.auth.getSession();
    
    if (!session) {
        window.location.href = 'login.html'; // Redirect to login if not authenticated
        return;
    }
    
    const user = session.user;
    
    // Fetch Profile
    const { data: profile } = await getUserProfile(user.id);
    if (profile && profile.username) {
        document.getElementById('welcomeMessage').textContent = `Welcome back, ${profile.username}.`;
    }
    
    // Fetch Bottles
    const { data: bottles, error } = await getUserBottles(user.id);
    
    if (error) {
        console.error("Error fetching bottles", error);
        return;
    }
    
    // Calculate Stats
    const totalBottles = bottles ? bottles.length : 0;
    document.getElementById('totalBottles').textContent = totalBottles;
    
    const now = new Date();
    let upcomingCount = 0;
    
    const moodCounts = {};
    let dominantMood = 'None';
    let maxMoodCount = 0;
    
    const bottlesGrid = document.getElementById('bottlesGrid');
    bottlesGrid.innerHTML = ''; // Clear dummy data
    
    if (totalBottles === 0) {
        bottlesGrid.innerHTML = '<p style="color:var(--text-light)">You have not sealed any memories yet.</p>';
    } else {
        bottles.forEach(bottle => {
            // Count upcoming
            const unlockDate = new Date(bottle.unlock_date);
            if (unlockDate > now) {
                upcomingCount++;
            }
            
            // Calculate dominant mood
            moodCounts[bottle.mood] = (moodCounts[bottle.mood] || 0) + 1;
            if (moodCounts[bottle.mood] > maxMoodCount) {
                maxMoodCount = moodCounts[bottle.mood];
                dominantMood = getMoodLabel(bottle.mood);
            }
            
            // Inject dynamic HTML
            const localeDate = unlockDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
            const isUnlocked = unlockDate <= now;
            
            const moodColor = bottle.theme || getPresetMoodColor(bottle.mood);
            const moodGradient = buildBottleGradient(moodColor, 0.6, 0.2);
            const glowColor = hexToRgba(moodColor, 0.35);
            
            // Generate the public link for this bottle
            const shareUrl = `${window.location.origin}${window.location.pathname.replace('dashboard.html', 'viewer.html')}?id=${bottle.id}`;

            const div = document.createElement('div');
            // Remove 'locked' class if it's already unlockable
            div.className = `bottle-item ${isUnlocked ? '' : 'locked'}`;
            // Add a cursor pointer and click handler so we can open it!
            div.style.cursor = 'pointer';
            
            div.innerHTML = `
                <div class="bottle-icon" style="background: ${moodGradient}; ${isUnlocked ? 'box-shadow: 0 0 20px ' + glowColor + ';' : ''}">
                    <div class="bottle-shape-mini" style="background: ${moodGradient};"></div>
                </div>
                <h4>${bottle.title}</h4>
                <p class="unlock-date" style="color: ${isUnlocked ? '#2a9d8f' : ''}">
                    ${isUnlocked ? 'Ready to Open!' : 'Unlocks: ' + localeDate}
                </p>
                <div class="mood-tag ${bottle.mood}">${getMoodLabel(bottle.mood)}</div>
                <button class="btn-ghost share-btn" style="margin-top: 10px; width: 100%; border: 1px solid rgba(0,0,0,0.1); font-size: 0.85rem;" title="Copy shareable link">
                    🔗 Copy Link
                </button>
            `;
            
            // Navigate to viewer when clicking the card
            div.addEventListener('click', (e) => {
                // Don't navigate if they clicked the share button
                if (e.target.closest('.share-btn')) return;
                window.location.href = `viewer.html?id=${bottle.id}`;
            });

            // Handle the share button click
            const shareBtn = div.querySelector('.share-btn');
            shareBtn.addEventListener('click', async (e) => {
                e.stopPropagation(); // prevent card click
                try {
                    await navigator.clipboard.writeText(shareUrl);
                    const originalText = shareBtn.innerHTML;
                    shareBtn.innerHTML = '✅ Copied!';
                    setTimeout(() => shareBtn.innerHTML = originalText, 2000);
                } catch (err) {
                    alert('Failed to copy link. Your link is:\n' + shareUrl);
                }
            });
            
            bottlesGrid.appendChild(div);
        });
    }
    
    document.getElementById('upcomingUnlocks').textContent = upcomingCount;
    document.getElementById('dominantMood').textContent = dominantMood;

    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await logoutUser();
            window.location.href = 'index.html';
        });
    }
});

