"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Event = {
  id: number;
  summary: string;
  start_time: string;
};

export default function NewNewsletterPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventIds, setSelectedEventIds] = useState<number[]>([]);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchEvents = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user?.id) return;

      const { data, error } = await supabase
        .from("google_calendar_events")
        .select("id, summary, start_time")
        .eq("user_id", user.id)
        .gte("start_time", new Date().toISOString())
        .order("start_time", { ascending: true });

      if (!error && data) setEvents(data);
    };

    fetchEvents();
  }, []);

  const toggleEvent = (eventId: number) => {
    setSelectedEventIds((prev) =>
      prev.includes(eventId)
        ? prev.filter((id) => id !== eventId)
        : [...prev, eventId]
    );
  };

  const generateNewsletter = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.id) return;

    // 🧠 Replace this with a real Claude call later
    const generatedBody = await callClaudeModel(selectedEventIds, prompt);

    // Step 1: Insert newsletter
    const { data: newsletter, error } = await supabase
      .from("newsletters")
      .insert({
        user_id: user.id,
        title: `Generated on ${new Date().toLocaleDateString()}`,
        body: generatedBody,
        status: "draft",
      })
      .select()
      .single();

    if (!newsletter || error) {
      console.error("Failed to create newsletter:", error);
      setLoading(false);
      return;
    }

    // Step 2: Link selected events
    if (selectedEventIds.length > 0) {
      const links = selectedEventIds.map((eventId) => ({
        newsletter_id: newsletter.id,
        event_id: eventId,
      }));

      const { error: linkError } = await supabase
        .from("newsletter_event_links")
        .insert(links);

      if (linkError) console.error("Failed to link events:", linkError);
    }

    router.push("/generate-newsletter");
  };

  const callClaudeModel = async (selectedIds: number[], userPrompt: string) => {
    // 🧠 Placeholder for Claude API call (actual API call later)
    return `Generated newsletter for events [${selectedIds.join(
      ", "
    )}] using Claude with prompt: ${userPrompt}`;
  };

  return (
    <div className="flex h-full">
      {/* Main Section */}
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        <h1 className="text-2xl font-bold">Create New Newsletter</h1>

        {/* Prompt input */}
        <div>
          <label className="block font-semibold mb-2">
            Instructions for Claude (optional)
          </label>
          <textarea
            className="w-full border rounded p-3"
            rows={6}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Highlight upcoming VIP previews and use a sophisticated tone."
          />
        </div>

        <button
          disabled={loading}
          onClick={generateNewsletter}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {loading ? "Generating..." : "Generate Newsletter"}
        </button>
      </div>

      {/* Sidebar Section */}
      <div className="w-80 p-6 bg-gray-50 border-l overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Select Events</h2>
        {events.length === 0 ? (
          <p className="text-gray-500 text-sm">No upcoming events found.</p>
        ) : (
          <ul className="space-y-3">
            {events.map((event) => (
              <li key={event.id}>
                <label className="flex items-start space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedEventIds.includes(event.id)}
                    onChange={() => toggleEvent(event.id)}
                  />
                  <div>
                    <div className="font-medium">{event.summary}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(event.start_time).toLocaleString()}
                    </div>
                  </div>
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
