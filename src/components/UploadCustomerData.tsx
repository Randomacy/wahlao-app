"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

type UploadProps = {
  onClose: () => void;
  onUploadSuccess: () => void;
};

export default function UploadCustomerData({ onClose, onUploadSuccess }: UploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  // Handle File Upload
  const handleUpload = async () => {
    if (!file) return alert("Please upload a file first!");
    setUploading(true);

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from("customer-data")
      .upload(`uploads/${Date.now()}-${file.name}`, file);

    if (error) {
      alert("Error uploading file: " + error.message);
      setUploading(false);
      return;
    }

    // Insert metadata into 'customer_data' table
    const { error: dbError } = await supabase.from("customer_data").insert({
      file_name: file.name,
      file_path: data.path,
    });

    if (dbError) {
      alert("Error inserting record: " + dbError.message);
      setUploading(false);
      return;
    }

    // Send notification email
    await fetch("/api/send-email", {
      method: "POST",
      body: JSON.stringify({
        subject: "New Customer Data Uploaded",
        text: `A new file (${file.name}) has been uploaded to WAH LAO.`,
      }),
    });

    alert("File uploaded successfully!");
    setUploading(false);
    onUploadSuccess(); // Mark as connected
    onClose(); // Close modal
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        accept=".xlsx, .csv"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="w-full border p-2 rounded-md"
      />
      <button
        onClick={handleUpload}
        className={`w-full p-2 text-white rounded-md ${
          uploading ? "bg-gray-500 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
        }`}
        disabled={uploading}
      >
        {uploading ? "Uploading..." : "Upload File"}
      </button>
    </div>
  );
}
