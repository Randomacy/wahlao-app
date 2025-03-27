"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import useAuthRedirect from "@/hooks/useAuthRedirect";

export default function SignInPage() {
  useAuthRedirect();

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) setMessage(error.message);
    else {
      setSent(true);
      setMessage("Check your email for the magic link to log in!");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow w-full max-w-md">
        <h1 className="text-xl font-bold mb-4 text-center">
          Sign in to WAH LAO
        </h1>
        <form onSubmit={handleSignIn} className="space-y-4">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border px-4 py-2 rounded-md"
            required
          />
          <button
            type="submit"
            disabled={sent}
            className={`w-full py-2 rounded-md transition text-white ${
              sent
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {sent ? "Email Sent" : "Send Magic Link"}
          </button>
        </form>
        {message && (
          <p className="mt-4 text-center text-sm text-gray-600">{message}</p>
        )}
      </div>
    </main>
  );
}
