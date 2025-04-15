"use client";
import { useState } from "react";
import DataSourceCard from "@/components/DataSourceCard";
import Modal from "@/components/Modal";
import UploadCustomerData from "@/components/UploadCustomerData";
import { supabase } from "@/lib/supabaseClient";

export default function ConnectDataPage() {
  // State to track connected sources
  const [connectedSources, setConnectedSources] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State to track which source is being connected
  const [currentSource, setCurrentSource] = useState<string | null>(null);

  // Handle source connection/disconnection
  const toggleConnection = async (source: string) => {
    if (connectedSources.includes(source)) {
      setConnectedSources(connectedSources.filter((item) => item !== source));
    } else {
      if (source === "Customer Data") {
        setCurrentSource(source);
        setIsModalOpen(true);
      } else if (source === "Google Calendar") {
        const { data, error } = await supabase.auth.getUser();

        if (error || !data?.user) {
          console.error("User not found:", error);
          alert("You're not logged in.");
          return;
        }

        const userId = data.user.id;
        console.log("Redirecting with user ID:", userId);

        // ✅ Only redirect AFTER you have userId
        window.location.href = `/api/oauth/google/start?user_id=${userId}`;
      } else {
        setConnectedSources([...connectedSources, source]);
      }
    }
  };

  // List of data sources
  const dataSources = [
    {
      name: "Customer Data",
      description: "Migrate and manage your Excel customer dataset.",
      icon: "👥",
    },
    {
      name: "Google Calendar",
      description: "Sync events and updates directly to your calendar.",
      icon: "📅",
    },
    {
      name: "Google Drive",
      description: "Access artist and artwork information from stored files.",
      icon: "📂",
    },
    {
      name: "Branding Document",
      description: "Upload or manage your brand guidelines.",
      icon: "🎨",
    },
    {
      name: "WhatsApp",
      description: "Sync messages and send automated updates to clients.",
      icon: "📲",
    },
    {
      name: "Newsletter App",
      description: "Manage and analyze newsletter performance.",
      icon: "📰",
    },
  ];

  return (
    <div className="flex flex-col flex-1 p-6 space-y-6 overflow-hidden">
      {/* Main Heading */}
      <h1 className="text-2xl font-bold">Connect Data Sources</h1>

      {/* Informative Text */}
      <p className="text-sm text-gray-600 leading-relaxed max-w-3xl mb-2">
        Connect your data sources so we can craft the perfect newsletters and
        messages for you to build and maintain relationships with your buyers.
        We never share, sell, or use your data to train AI models.
      </p>
      <p className="text-sm text-gray-600 leading-relaxed max-w-3xl mb-6">
        Processing can take up to a couple hours. We'll email you when it's
        ready!
      </p>

      {/* Grid Layout for Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {dataSources.map((source) => (
          <DataSourceCard
            key={source.name}
            name={source.name}
            description={source.description}
            icon={source.icon}
            isConnected={connectedSources.includes(source.name)}
            onToggle={() => toggleConnection(source.name)}
          />
        ))}
      </div>

      {/* Modal for Customer Data */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Upload Customer Data"
      >
        <UploadCustomerData
          onClose={() => setIsModalOpen(false)}
          onUploadSuccess={() =>
            setConnectedSources([...connectedSources, "Customer Data"])
          }
        />
      </Modal>
    </div>
  );
}
