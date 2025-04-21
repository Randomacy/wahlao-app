"use client";
import { useRouter } from "next/navigation";

export default function DashboardActions() {
  const router = useRouter();

  return (
    <div className="space-y-4">
      <button
        onClick={() => router.push("/generate-newsletter")}
        className="w-full p-4 bg-gray-800 text-white rounded-lg hover:bg-gray-900"
      >
        ✉️ Generate a newsletter
      </button>

      <button
        onClick={() => router.push("/dashboard/newsletter-to-wa")}
        className="w-full p-4 bg-green-500 text-white rounded-lg hover:bg-green-600"
      >
        🔄 Turn newsletter into WhatsApp (WA)
      </button>

      <button
        onClick={() => router.push("/dashboard/connect-data")}
        className="w-full p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        🔗 Link my data together
      </button>
    </div>
  );
}
