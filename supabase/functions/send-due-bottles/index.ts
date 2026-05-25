import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

type DueBottle = {
  id: string;
  title: string;
  message: string;
  mood: string;
  unlock_date: string;
  theme: string | null;
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
    .select('id, title, message, mood, unlock_date, theme, opened, delivery_status, delivered_at, profiles!inner(email, username)')
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
    const recipientEmail = bottle.profiles?.email;

    if (!recipientEmail) {
      await admin.from('bottles').update({
        delivery_status: 'failed',
        delivery_error: 'Missing recipient email'
      }).eq('id', bottle.id);

      results.push({ id: bottle.id, status: 'failed', message: 'Missing recipient email' });
      continue;
    }

    const subject = `Your memory "${bottle.title}" is ready`;
    const text = [
      `Your memory is ready to open.`,
      '',
      `Title: ${bottle.title}`,
      `Mood: ${bottle.mood}`,
      `Unlock date: ${bottle.unlock_date}`,
      '',
      bottle.message
    ].join('\n');

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 680px; margin: 0 auto; padding: 24px;">
        <h1 style="font-size: 24px; margin-bottom: 8px;">Your memory is ready to open</h1>
        <p style="margin: 0 0 16px 0;"><strong>Title:</strong> ${escapeHtml(bottle.title)}</p>
        <p style="margin: 0 0 16px 0;"><strong>Mood:</strong> ${escapeHtml(bottle.mood)}</p>
        <div style="white-space: pre-wrap; background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 16px; padding: 20px; margin: 20px 0;">${escapeHtml(bottle.message)}</div>
        <p style="margin: 0; color: #6b7280;">Open it in Message in a Bottle when you are ready.</p>
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
