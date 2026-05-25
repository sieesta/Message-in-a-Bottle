import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

type DueBottle = {
  id: string;
  title: string;
  message: string;
  mood: string;
  unlock_date: string;
  theme: string | null;
  recipient_name: string | null;
  recipient_email: string | null;
  profiles?: {
    email: string | null;
    username: string | null;
  } | null;
};

Deno.serve(async () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  const resendFrom = Deno.env.get('RESEND_FROM_EMAIL');

  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(JSON.stringify({ error: 'Missing Supabase environment variables.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false }
  });

  const today = new Date().toISOString().slice(0, 10);

  const { data: bottles, error: fetchError } = await admin
    .from('bottles')
    .select('id, title, message, mood, unlock_date, theme, opened, delivery_status, delivered_at, recipient_name, recipient_email, profiles!inner(email, username)')
    .lte('unlock_date', today)
    .is('delivered_at', null)
    .eq('opened', false)
    .order('created_at', { ascending: true });

  if (fetchError) {
    return new Response(JSON.stringify({ error: fetchError.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const dueBottles = (bottles ?? []) as DueBottle[];
  const results: Array<{ id: string; status: string; message: string }> = [];

  for (const bottle of dueBottles) {
    // Prefer recipient_email if set, otherwise fallback to the creator's email
    const recipientEmail = bottle.recipient_email || bottle.profiles?.email;
    const recipientName = bottle.recipient_name || bottle.profiles?.username || 'Friend';
    const siteUrl = Deno.env.get('YOUR_SITE_URL') || 'https://yourwebsite.com'; // Add YOUR_SITE_URL to Supabase edge function secrets

    if (!recipientEmail) {
      await admin.from('bottles').update({
        delivery_status: 'failed',
        delivery_error: 'Missing recipient email'
      }).eq('id', bottle.id);

      results.push({ id: bottle.id, status: 'failed', message: 'Missing recipient email' });
      continue;
    }

    const subject = `A memory "${bottle.title}" has unlocked for you`;
    const text = [
      `Hello ${recipientName},`,
      `A message in a bottle is now ready to open.`,
      '',
      `Title: ${bottle.title}`,
      `Mood: ${bottle.mood}`,
      `Unlock date: ${bottle.unlock_date}`,
      '',
      `Open it here: ${siteUrl}/viewer.html?id=${bottle.id}`
    ].join('\n');

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 680px; margin: 0 auto; padding: 24px;">
        <h1 style="font-size: 24px; margin-bottom: 8px;">Hello ${escapeHtml(recipientName)},</h1>
        <p style="margin: 0 0 16px 0;">A memory is now ready to open.</p>
        <p style="margin: 0 0 16px 0;"><strong>Title:</strong> ${escapeHtml(bottle.title)}</p>
        <p style="margin: 0 0 16px 0;"><strong>Mood:</strong> ${escapeHtml(bottle.mood)}</p>
        <a href="${siteUrl}/viewer.html?id=${bottle.id}" style="display: inline-block; background-color: #000; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 30px; font-weight: bold; margin: 20px 0;">Break the Seal</a>
        <p style="margin: 0; color: #6b7280;">Or copy and paste this link: ${siteUrl}/viewer.html?id=${bottle.id}</p>
      </div>
    `;

    if (!resendApiKey || !resendFrom) {
      await admin.from('bottles').update({
        delivery_status: 'pending',
        delivery_error: 'Email service not configured'
      }).eq('id', bottle.id);

      results.push({ id: bottle.id, status: 'pending', message: 'Email service not configured' });
      continue;
    }

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendApiKey}`
      },
      body: JSON.stringify({
        from: resendFrom,
        to: [recipientEmail],
        subject,
        text,
        html
      })
    });

    if (!resendResponse.ok) {
      const errorText = await resendResponse.text();
      await admin.from('bottles').update({
        delivery_status: 'failed',
        delivery_error: errorText.slice(0, 250)
      }).eq('id', bottle.id);

      results.push({ id: bottle.id, status: 'failed', message: errorText.slice(0, 120) });
      continue;
    }

    await admin.from('bottles').update({
      delivery_status: 'sent',
      delivered_at: new Date().toISOString(),
      delivery_error: null
    }).eq('id', bottle.id);

    results.push({ id: bottle.id, status: 'sent', message: `Sent to ${recipientEmail}` });
  }

  return new Response(JSON.stringify({ count: results.length, results }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
});

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
