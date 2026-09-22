"use client";

import { AttachmentUpload } from "@/components/attachments/AttachmentUpload";

export default function AttachmentTestPage() {
  const handleUpload = (attachment: {
    filename: string;
    url: string;
    fileType: string;
    fileSize: number;
  }) => {
    console.log("Attachment received:", attachment);
  };

  return (
    <main className="flex min-h-screen items-center justify-center">
      <AttachmentUpload onUpload={handleUpload} />
    </main>
  );
}