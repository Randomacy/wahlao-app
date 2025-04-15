// lib/syncGoogleCalendar.ts
import { google } from "googleapis";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function syncGoogleCalendar(user_id: string) {
  const { data: tokenRow, error: tokenError } = await supabase
    .from("calendar_tokens")
    .select("*")
    .eq("user_id", user_id)
    .order("connected_at", { ascending: false })
    .limit(1)
    .single();

  if (tokenError || !tokenRow?.access_token) {
    throw new Error("No valid access token found");
  }

  const oauth2Client = new google.auth.OAuth2();
  console.log("🔐 Using access token:", tokenRow.access_token);
  console.log("🔄 Syncing calendar for user:", user_id);

  oauth2Client.setCredentials({ access_token: tokenRow.access_token });

  const calendar = google.calendar({ version: "v3", auth: oauth2Client });
  const now = new Date();
  const oneMonthLater = new Date();
  oneMonthLater.setMonth(now.getMonth() + 1);

  console.log(now.toISOString())
  console.log(oneMonthLater.toISOString())

  const eventsRes = await calendar.events.list({
    calendarId: "primary",
    timeMin: new Date().toISOString(),
    timeMax: oneMonthLater.toISOString(),
    maxResults: 100,
    singleEvents: true,
    orderBy: "startTime",
  });

  const events = eventsRes.data.items || [];

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
    }
  }

  return { synced: events.length };
}
