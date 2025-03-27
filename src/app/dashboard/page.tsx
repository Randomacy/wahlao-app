"use client";

import useAuthRedirect from "@/hooks/useAuthRedirect";
import Greeting from "@/components/Greeting";
import DashboardActions from "@/components/DashboardActions";

export default function DashboardPage() {
  useAuthRedirect();

  return (
    <div className="flex flex-col flex-1 p-6 space-y-6">
      {/* Greeting (Unchanged) */}
      <Greeting />

      {/* Centered Content Block - Vertically and Horizontally */}
      <div className="flex justify-center items-center h-[calc(80vh-100px)]">
        <div className="w-full max-w-2xl p-6">
          {/* What do you want to do today? */}
          <div className="text-xl font-bold mb-4 text-center">
            What do you want to do today?
          </div>

          {/* Action Buttons */}
          <DashboardActions />
        </div>
      </div>
    </div>
  );
}
