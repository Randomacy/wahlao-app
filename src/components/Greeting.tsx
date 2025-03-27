"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Greeting() {
  const [firstName, setFirstName] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data } = await supabase
          .from("user_profiles")
          .select("first_name")
          .eq("user_id", user.id)
          .maybeSingle();

        if (data?.first_name) {
          setFirstName(data.first_name);
        }
      }
    };

    fetchUser();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return `Good morning, ${firstName || "User"}`;
    if (hour < 18) return `Good afternoon, ${firstName || "User"}`;
    return `Good evening, ${firstName || "User"}`;
  };

  return <h1 className="text-2xl font-bold">{getGreeting()}</h1>;
}
