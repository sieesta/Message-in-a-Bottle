// Supabase configuration
const SUPABASE_URL = 'https://dqykqsoxympaglnzxzpl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxeWtxc294eW1wYWdsbnp4enBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2NjIxODksImV4cCI6MjA5NTIzODE4OX0.fC4JTKG2TrDjerOjAAU4MLI9zRDWUm6KfrqeUUlZXC8';

// Initialize Supabase Client
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Example Functions for the App

async function signUpUser(email, password, username) {
    const { data, error } = await supabaseClient.auth.signUp({
        email: email,
        password: password,
        options: {
            data: { username: username }
        }
    });
    return { data, error };
}

async function loginUser(email, password) {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
    });
    return { data, error };
}

async function logoutUser() {
    const { error } = await supabaseClient.auth.signOut();
    return { error };
}

async function createBottle(userId, title, message, mood, unlockDate, spotifyUrl) {
    const { data, error } = await supabaseClient
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