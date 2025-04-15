"use client";

import { useEffect } from "react";
import useAuthRedirect from "@/hooks/useAuthRedirect";
import Greeting from "@/components/Greeting";
import DashboardActions from "@/components/DashboardActions";
import { supabase } from "@/lib/supabaseClient";

export default function DashboardPage() {
  useAuthRedirect();

  useEffect(() => {
    const syncCalendar = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (!user?.id || error) {
        console.error("Unable to get Supabase user:", error);
        return;
      }

      console.log("🔄 Syncing Google Calendar for user:", user.id);

      const res = await fetch("/api/google-calendar/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id }),
      });

      const json = await res.json();
      console.log("✅ Sync complete:", json);
    };

    syncCalendar();
  }, []);

  return (
    <div className="flex flex-col flex-1 p-6 space-y-6">
      <Greeting />
      <div className="flex justify-center items-center h-[calc(80vh-100px)]">
        <div className="w-full max-w-2xl p-6">
          <div className="text-xl font-bold mb-4 text-center">
            What do you want to do today?
          </div>
          <DashboardActions />
        </div>
      </div>
    </div>
  );
}
