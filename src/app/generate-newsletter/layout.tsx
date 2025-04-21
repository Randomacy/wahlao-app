"use client";

import Sidebar from "@/components/Sidebar";
import useAuthRedirect from "@/hooks/useAuthRedirect";
import useOnboardingRedirect from "@/hooks/useOnboardingRedirect";

export default function NewsletterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useAuthRedirect();
  useOnboardingRedirect();

  return (
    <div className="flex h-screen">
      {/* Sidebar like Dashboard */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
