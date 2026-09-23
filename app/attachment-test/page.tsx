"use client";

import { AttachmentUpload } from "@/components/attachments/AttachmentUpload";

interface AttachmentData {
  filename: string;
  url: string;
  fileType: string;
  fileSize: number;
  cloudinaryPublicId: string;
  cloudinaryResourceType: string;
}

export default function AttachmentTestPage() {
  const handleUpload = async (attachment: AttachmentData) => {
    console.log("Attachment received:", attachment);

    try {
      // Send the Cloudinary metadata to our backend.
      // The backend will create the Attachment record in PostgreSQL.
      const response = await fetch("/api/attachments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(attachment),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Failed to save attachment:", data);
        return;
      }

      console.log("Attachment saved to database:", data);
    } catch (error) {
      console.error("Error saving attachment:", error);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center">
      <AttachmentUpload onUpload={handleUpload} />
    </main>
  );
}