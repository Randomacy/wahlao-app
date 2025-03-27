"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import useLogout from "@/hooks/useLogout";

export default function Sidebar() {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();
  const logout = useLogout();

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser(); // ✅ Fetch email from auth

      if (user) {
        const { data } = await supabase
          .from("user_profiles")
          .select("first_name, last_name")
          .eq("user_id", user.id)
          .maybeSingle();

        // ✅ Combine profile data with email
        if (data) {
          setUserProfile({
            ...data,
            email: user.email, // Add email from auth
          });
        }
      }
    };

    fetchProfile();
  }, []);

  // Generate initials for avatar
  const getInitials = (firstName: string, lastName: string) => {
    if (!firstName || !lastName) return "NA";
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  return (
    <div className="w-64 h-screen bg-white shadow-md p-4 flex flex-col justify-between">
      {/* Top Section */}
      <div>
        {/* Title */}
        <div className="text-2xl font-bold mt-8 mb-6 text-center text-gray-700">
          WAH LAO
        </div>

        {/* Menu - Aligned Directly Below */}
        <nav className="space-y-2">
          <Link href="/dashboard">
            <div className="p-2 rounded hover:bg-gray-100 cursor-pointer flex items-center space-x-2">
              🏠 <span>Dashboard</span>
            </div>
          </Link>

          {/* Product Category - Non-clickable */}
          <div className="text-sm font-semibold text-gray-500 mt-4 mb-1">
          Product
          </div>

          <Link href="/dashboard/newsletter">
            <div className="p-2 rounded hover:bg-gray-100 cursor-pointer flex items-center space-x-2">
              📰 <span>Newsletter Generator</span>
            </div>
          </Link>
          <Link href="/dashboard/whatsapp-gen">
            <div className="p-2 rounded hover:bg-gray-100 cursor-pointer flex items-center space-x-2">
              📲 <span>Newsletter &gt; WhatsApp</span>
            </div>
          </Link>
        </nav>
      </div>

      {/* Settings Link - Move to Bottom */}
      <div className="mt-auto">
        <Link href="/dashboard/settings">
          <div className="p-2 rounded hover:bg-gray-100 cursor-pointer flex items-center space-x-2">
            ⚙️ <span>Settings</span>
          </div>
        </Link>

        {/* Profile Section - Stuck at Bottom */}
        <div className="relative mt-4">
          <div
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center p-4 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200"
          >
            {/* Circular Avatar - Fixed */}
            <div className="w-10 h-10 shrink-0 rounded-full bg-blue-500 text-white flex items-center justify-center text-lg font-bold">
              {userProfile?.first_name && userProfile?.last_name
                ? getInitials(userProfile.first_name, userProfile.last_name)
                : "NA"}
            </div>
            <div className="ml-4 truncate">
              <div className="font-bold">
                {userProfile?.first_name || "Unknown"}{" "}
                {userProfile?.last_name || "User"}
              </div>
              <div className="text-xs text-gray-500 truncate">
                {userProfile?.email || "No Email"}
              </div>
            </div>
          </div>

          {/* Dropdown Menu (Fixed to the Right) */}
          {showDropdown && (
            <div className="absolute left-full bottom-0 mb-2 ml-2 w-56 bg-white shadow-md rounded-lg z-50">
              <div className="p-4 space-y-2">
                <Link href="/dashboard/settings">
                  <div className="cursor-pointer hover:bg-gray-100 p-2 rounded">
                    ⚙️ Profile Settings
                  </div>
                </Link>
                <div
                  onClick={logout}
                  className="cursor-pointer text-red-500 hover:bg-gray-100 p-2 rounded"
                >
                  🚪 Log out
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
