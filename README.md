# Message in a Bottle

A modern emotional wellness web application and digital time capsule.
Uses HTML, CSS, JavaScript, Supabase, and the free iTunes Search API.

## Setup Instructions
1. Setup a Supabase project at supabase.com.
2. Run the SQL located in the Supabase documentation to create `users` and `bottles` tables.
3. Replace connection strings in `js/supabase.js`.
4. Open `index.html` in your browser.

## Deployment Notes
1. Run `database.sql` in the Supabase SQL editor to create the tables, RLS policies, and delivery tracking columns.
2. Deploy `supabase/functions/send-due-bottles/index.ts` as a Supabase Edge Function.
3. Set these secrets for the edge function: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, and `RESEND_FROM_EMAIL`.
4. Schedule the function to run every few minutes so due bottles are emailed when their unlock date arrives.
5. The create page now supports a custom mood text and a mood color picker, and the dashboard/viewer use that saved color theme.

## Features
- Glassmorphism design and smooth animations
- Supabase Authentication
- Time-locked messaging
- iTunes song search with preview audio
- Dynamic CSS based on preset moods or a custom mood color
- Unlock-time email delivery via Supabase Edge Function