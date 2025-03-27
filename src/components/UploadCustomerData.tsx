"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

type UploadProps = {
  onClose: () => void;
  onUploadSuccess: () => void;
};

export default function UploadCustomerData({
  onClose,
  onUploadSuccess,
}: UploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  // Handle File Upload
  const handleUpload = async () => {
    if (!file) {
      alert("Please upload a file first!");
      return;
    }

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

    // Send notification email (Optional)
    await fetch("/api/send-email", {
      method: "POST",
      body: JSON.stringify({
        subject: "New Customer Data Uploaded",
        text: `A new file (${file.name}) has been uploaded to WAH LAO.`,
      }),
    });

    alert("✅ File uploaded successfully!");
    setUploading(false);
    onUploadSuccess(); // Mark as connected
    onClose(); // Close modal
  };

  return (
    <div className="space-y-6">
      {/* Informative Text */}
      <p className="text-sm text-gray-600 leading-relaxed">
        Upload an Excel or CSV file containing your customer data. This file
        will be stored securely and used to generate personalized newsletters
        and messages.
      </p>

      {/* File Input */}
      <div className="flex items-center space-x-4">
        <input
          type="file"
          accept=".xlsx, .csv"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Upload Button - Polished Version */}
      <button
        onClick={handleUpload}
        className={`w-full p-3 text-white rounded-lg ${
          uploading
            ? "bg-gray-500 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 transition-transform transform hover:scale-105"
        }`}
        disabled={uploading}
      >
        {uploading ? "Uploading..." : "🚀 Upload File"}
      </button>
    </div>
  );
}
