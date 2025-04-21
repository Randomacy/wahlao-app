import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { user_id } = await req.json();

  if (!user_id) {
    return NextResponse.json({ error: "Missing user_id" }, { status: 400 });
  }

  // Get the most recent access token
  const { data: tokenRow, error: tokenError } = await supabase
    .from("calendar_tokens")
    .select("*")
    .eq("user_id", user_id)
    .order("connected_at", { ascending: false })
    .limit(1)
    .single();

  if (tokenError || !tokenRow?.access_token) {
    return NextResponse.json(
      { error: "No access token found" },
      { status: 401 }
    );
  }

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: tokenRow.access_token });

  const calendar = google.calendar({ version: "v3", auth: oauth2Client });
  console.log("📡 Calling Google Calendar API...");
  
  const now = new Date();
  const oneMonthLater = new Date();
  oneMonthLater.setMonth(now.getMonth() + 1);
  
  try {
    const eventsRes = await calendar.events.list({
      calendarId: "primary",
      timeMin: new Date().toISOString(), // upcoming only
      timeMax: oneMonthLater.toISOString(),
      maxResults: 100,
      singleEvents: true,
      orderBy: "startTime",
    });
    console.log("📥 Google Calendar API response:", eventsRes.data);

    const events = eventsRes.data.items || [];
    const results: { event_id: string; upserted: boolean; error: any }[] = [];

    for (const event of events) {
      const existing = await supabase
        .from("google_calendar_events")
        .select("id, google_updated_at")
        .eq("user_id", user_id)
        .eq("google_event_id", event.id)
        .maybeSingle();

      const isNew = !existing.data;
      const isUpdated =
        event.updated &&
        (!existing.data?.google_updated_at ||
          new Date(event.updated) > new Date(existing.data.google_updated_at));

      if (isNew || isUpdated) {
        const { error: upsertError } = await supabase
          .from("google_calendar_events")
          .upsert(
            {
              user_id,
              google_event_id: event.id,
              calendar_id: event.organizer?.email || null,
              summary: event.summary || "",
              description: event.description || "",
              location: event.location || "",
              start_time: event.start?.dateTime || event.start?.date || null,
              end_time: event.end?.dateTime || event.end?.date || null,
              google_updated_at: event.updated
                ? new Date(event.updated).toISOString()
                : null,
              last_synced: new Date().toISOString(),
            },
            { onConflict: "user_id, google_event_id" }
          );

        if (upsertError) {
          console.error("❌ Failed to upsert event:", event.id, upsertError);
        } else {
          console.log("✅ Upserted event:", event.id);
        }
      } else {
        console.log("ℹ️ Skipped event (not new or updated):", event.id);
      }
    }

    return NextResponse.json({
      success: true,
      synced: results.length,
      events: results,
    });
  } catch (err: any) {
    console.error("Google Calendar Sync Error:", err);
    return NextResponse.json(
      { error: "Google API failed", details: err },
      { status: 500 }
    );
  }
}
