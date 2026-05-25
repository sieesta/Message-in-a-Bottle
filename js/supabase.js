// Supabase configuration
// Add the Supabase JS client via CDN inside HTML files like so:
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

/*
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Example Functions for the App

async function signUpUser(email, password, username) {
    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
            data: { username: username }
        }
    });
    return { data, error };
}

async function loginUser(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
    });
    return { data, error };
}

async function createBottle(userId, title, message, mood, unlockDate, spotifyUrl) {
    const { data, error } = await supabase
        .from('bottles')
        .insert([
            {
                user_id: userId,
                title: title,
                message: message,
                mood: mood,
                unlock_date: unlockDate,
                spotify_url: spotifyUrl,
                opened: false
            }
        ]);
    return { data, error };
}
*/