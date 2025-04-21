"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type Newsletter = {
  id: string;
  title: string | null;
  created_at: string;
  status: string;
};

export default function NewsletterListPage() {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);

  useEffect(() => {
    const fetchNewsletters = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) return;

      const { data, error } = await supabase
        .from("newsletters")
        .select("id, title, created_at, status")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) console.error("Error loading newsletters:", error);
      else setNewsletters(data || []);
    };

    fetchNewsletters();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Newsletters</h1>
        <Link href="/generate-newsletter/new">
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            + New Newsletter
          </button>
        </Link>
      </div>

      {newsletters.length === 0 ? (
        <p className="text-gray-500">No newsletters yet.</p>
      ) : (
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-sm text-gray-600 border-b">
              <th className="py-2">Title</th>
              <th className="py-2">Created</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {newsletters.map((nl) => (
              <tr key={nl.id} className="border-b hover:bg-gray-50">
                <td className="py-2">{nl.title || "(Untitled)"}</td>
                <td className="py-2">
                  {new Date(nl.created_at).toLocaleString()}
                </td>
                <td className="py-2 capitalize">{nl.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
