"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function useOnboardingRedirect() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAndRedirect = async () => {
      // ✅ Step 1: Check if user is signed in
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/signin");
        return;
      }

      console.log("User ID:", user.id);

      // ✅ Step 2: Check if a profile exists
      const { data: existing, error } = await supabase
        .from("user_profiles")
        .select("is_onboarded")
        .eq("user_id", user.id)
        .maybeSingle(); // use maybeSingle to avoid PGRST116 errors

      // ✅ Step 3: If no profile, create a new one and redirect to onboarding
      if (!existing) {
        // Check if a row was just created in a previous attempt
        const { data: checkAgain } = await supabase
          .from("user_profiles")
          .select("is_onboarded")
          .eq("user_id", user.id)
          .maybeSingle();

        if (!checkAgain) {
          // Only insert if the row still doesn't exist
          const { error: insertError } = await supabase
            .from("user_profiles")
            .insert({
              user_id: user.id,
              is_onboarded: false,
            });

          if (insertError && insertError.code !== "23505") {
            console.error("Failed to insert new profile:", insertError.message);
            return;
          }
        }

        router.replace("/onboarding");
        return;
      }

      // ✅ Step 4: Handle is_onboarded check
      if (existing && !existing.is_onboarded && pathname !== "/onboarding") {
        router.replace("/onboarding");
        return;
      }

      if (existing && existing.is_onboarded && pathname === "/onboarding") {
        router.replace("/dashboard");
      }
    };

    checkAndRedirect();
  }, [pathname, router]);
}
