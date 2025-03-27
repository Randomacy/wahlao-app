"use client";
import useOnboardingRedirect from "@/hooks/useOnboardingRedirect";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  useOnboardingRedirect();
  return <>{children}</>;
}
