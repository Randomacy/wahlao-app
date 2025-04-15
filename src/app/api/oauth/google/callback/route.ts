import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { syncGoogleCalendar } from "@/lib/syncGoogleCalendar";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 👇 This will be used for all redirects
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const stateParam = url.searchParams.get("state");

  if (!code || !stateParam) {
    return NextResponse.redirect(
      `${baseUrl}/dashboard/connect-data?error=missing_code_or_state`
    );
  }

  let state;
  try {
    state = JSON.parse(decodeURIComponent(stateParam));
  } catch (e) {
    console.error("Invalid state format:", e);
    return NextResponse.redirect(
      `${baseUrl}/dashboard/connect-data?error=invalid_state`
    );
  }

  const { user_id, provider } = state;

  if (!user_id || provider !== "google_calendar") {
    return NextResponse.redirect(
      `${baseUrl}/dashboard/connect-data?error=unauthorized_flow`
    );
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!,
    process.env.GOOGLE_REDIRECT_URI!
  );

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const userInfoRes = await oauth2.userinfo.get();
    const googleEmail = userInfoRes.data.email;

    if (!googleEmail) {
      return NextResponse.redirect(
        `${baseUrl}/dashboard/connect-data?error=no_google_email`
      );
    }

    const { error: insertError } = await supabase
      .from("calendar_tokens")
      .upsert({
        user_id,
        google_email: googleEmail,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        scope: tokens.scope,
        token_type: tokens.token_type,
        expiry_date: tokens.expiry_date
          ? new Date(tokens.expiry_date).toISOString()
          : null,
      });

    if (insertError) {
      console.error("Token storage error:", insertError);
      return NextResponse.redirect(
        `${baseUrl}/dashboard/connect-data?error=store_failed`
      );
    }

    // ✅ Sync calendar immediately after saving token
    try {
      await syncGoogleCalendar(user_id);
    } catch (syncErr) {
      console.error("Failed to sync after token storage:", syncErr);
      // optional: could redirect with warning or continue silently
    }

    return NextResponse.redirect(
      `${baseUrl}/dashboard/connect-data?success=google_calendar_connected`
    );
  } catch (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.redirect(
      `${baseUrl}/dashboard/connect-data?error=oauth_exception`
    );
  }
}
