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

async function createBottle(userId, title, message, mood, themeColor, unlockDate, spotifyUrl) {
    const basePayload = {
        user_id: userId,
        title: title,
        message: message,
        mood: mood,
        theme: themeColor,
        unlock_date: unlockDate,
        spotify_url: spotifyUrl,
        opened: false
    };

    const primaryPayload = {
        ...basePayload,
        delivery_status: 'pending'
    };

    let result = await supabaseClient
        .from('bottles')
        .insert([primaryPayload]);

    if (!result.error) {
        return result;
    }

    if (!isMissingColumnError(result.error)) {
        return result;
    }

    result = await supabaseClient
        .from('bottles')
        .insert([basePayload]);

    return result;
}

async function markBottleOpenedAndDelivered(bottleId) {
    let result = await supabaseClient
        .from('bottles')
        .update({
            opened: true,
            delivery_status: 'delivered',
            delivered_at: new Date().toISOString()
        })
        .eq('id', bottleId);

    if (!result.error) {
        return result;
    }

    if (!isMissingColumnError(result.error)) {
        return result;
    }

    result = await supabaseClient
        .from('bottles')
        .update({ opened: true })
        .eq('id', bottleId);

    return result;
}

function isMissingColumnError(error) {
    if (!error || typeof error.message !== 'string') {
        return false;
    }

    return error.message.toLowerCase().includes('could not find the')
        || error.message.toLowerCase().includes('schema cache')
        || error.message.toLowerCase().includes('column');
}

async function getUserBottles(userId) {
    const { data, error } = await supabaseClient
        .from('bottles')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    return { data, error };
}

async function getUserProfile(userId) {
    const { data, error } = await supabaseClient
        .from('profiles')
        .select('username')
        .eq('id', userId)
        .single();
    return { data, error };
}