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
                dominantMood = bottle.mood.charAt(0).toUpperCase() + bottle.mood.slice(1);
            }
            
            // Inject dynamic HTML
            const localeDate = unlockDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
            const isUnlocked = unlockDate <= now;
            
            const div = document.createElement('div');
            // Remove 'locked' class if it's already unlockable
            div.className = `bottle-item ${isUnlocked ? '' : 'locked'}`;
            // Add a cursor pointer and click handler so we can open it!
            div.style.cursor = 'pointer';
            
            div.innerHTML = `
                <div class="bottle-icon" style="background: ${getMoodGradient(bottle.mood)}; ${isUnlocked ? 'box-shadow: 0 0 20px ' + getMoodGradient(bottle.mood) : ''}">
                    <div class="bottle-shape-mini" style="background: ${getMoodGradient(bottle.mood)};"></div>
                </div>
                <h4>${bottle.title}</h4>
                <p class="unlock-date" style="color: ${isUnlocked ? '#2a9d8f' : ''}">
                    ${isUnlocked ? 'Ready to Open!' : 'Unlocks: ' + localeDate}
                </p>
                <div class="mood-tag ${bottle.mood}">${bottle.mood.charAt(0).toUpperCase() + bottle.mood.slice(1)}</div>
            `;
            
            // Navigate to viewer!
            div.addEventListener('click', () => {
                window.location.href = `viewer.html?id=${bottle.id}`;
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

function getMoodGradient(mood) {
    switch(mood) {
        case 'happy': return 'linear-gradient(135deg, rgba(255, 183, 3, 0.6), rgba(251, 133, 0, 0.2))';
        case 'sad': return 'linear-gradient(135deg, rgba(0, 53, 102, 0.6), rgba(2, 62, 138, 0.3))';
        case 'calm': return 'linear-gradient(135deg, rgba(142, 202, 230, 0.6), rgba(33, 158, 188, 0.2))';
        case 'hopeful': return 'linear-gradient(135deg, rgba(233, 236, 239, 0.8), rgba(206, 212, 218, 0.5))';
        case 'romantic': return 'linear-gradient(135deg, rgba(255, 175, 204, 0.6), rgba(255, 200, 221, 0.3))';
        default: return 'linear-gradient(135deg, rgba(255,255,255,0.6), rgba(255,255,255,0.2))';
    }
}