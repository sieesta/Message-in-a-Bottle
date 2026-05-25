import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// These are CORS headers so your frontend is allowed to talk to this Edge Function securely
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // 1. Handle CORS preflight request from the browser
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 2. Read the search term sent from our frontend
    const { query } = await req.json()

    if (!query) {
      return new Response(JSON.stringify({ error: 'Query is required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // 3. SECURELY read our Spotify credentials (These come from Supabase Settings, not public code!)
    const clientId = Deno.env.get('SPOTIFY_CLIENT_ID')
    const clientSecret = Deno.env.get('SPOTIFY_CLIENT_SECRET')

    // 4. Ask Spotify for an Access Token
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(`${clientId}:${clientSecret}`)
      },
      body: 'grant_type=client_credentials'
    })

    const tokenResponseText = await tokenResponse.text()
    let tokenData;
    try {
        tokenData = JSON.parse(tokenResponseText);
    } catch (e) {
        throw new Error(`Spotify Token API returned non-JSON: ${tokenResponseText.substring(0, 100)}`);
    }
    
    if (!tokenData.access_token) {
        throw new Error('Failed to login to Spotify from backend')
    }

    // 5. Search Spotify with our secure token
    const searchResponse = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`, {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`
      }
    })

    const searchResponseText = await searchResponse.text()
    let searchData;
    try {
        searchData = JSON.parse(searchResponseText);
    } catch (e) {
        throw new Error(`Spotify Search API returned non-JSON: ${searchResponseText.substring(0, 100)}`);
    }

    // 6. Send the search results back to our frontend!
    return new Response(JSON.stringify(searchData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})