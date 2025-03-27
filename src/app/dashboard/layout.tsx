"use client";

import useAuthRedirect from "@/hooks/useAuthRedirect";
import useOnboardingRedirect from "@/hooks/useOnboardingRedirect";
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Ensure user is authenticated and onboarded
  useAuthRedirect();
  useOnboardingRedirect();

  return (
    <div className="flex h-screen">
      {/* Sidebar with full height */}
      <Sidebar />

      {/* Main content that stretches to fill the rest */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
