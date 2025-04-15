import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase service client (server-side)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const stateParam = url.searchParams.get('state');

  if (!code || !stateParam) {
    return NextResponse.redirect('/dashboard/connect-data?error=missing_code_or_state');
  }

  let state;
  try {
    state = JSON.parse(decodeURIComponent(stateParam));
  } catch (e) {
    console.error("Invalid state format:", e);
    return NextResponse.redirect('/dashboard/connect-data?error=invalid_state');
  }

  const { user_id, provider } = state;

  if (!user_id || provider !== 'google_calendar') {
    return NextResponse.redirect('/dashboard/connect-data?error=unauthorized_flow');
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!,
    process.env.GOOGLE_REDIRECT_URI!
  );

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Fetch user info (Google email)
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfoRes = await oauth2.userinfo.get();
    const googleEmail = userInfoRes.data.email;

    if (!googleEmail) {
      return NextResponse.redirect('/dashboard/connect-data?error=no_google_email');
    }

    // Upsert token to calendar_tokens table
    const { error: insertError } = await supabase.from('calendar_tokens').upsert({
      user_id,
      google_email: googleEmail,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      scope: tokens.scope,
      token_type: tokens.token_type,
      expiry_date: tokens.expiry_date
        ? new Date(tokens.expiry_date * 1000).toISOString()
        : null,
    });

    if (insertError) {
      console.error("Token storage error:", insertError);
      return NextResponse.redirect('/dashboard/connect-data?error=store_failed');
    }

    return NextResponse.redirect('/dashboard/connect-data?success=google_calendar_connected');
  } catch (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.redirect('/dashboard/connect-data?error=oauth_exception');
  }
}
