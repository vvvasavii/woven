"use client";

import { CldUploadWidget } from "next-cloudinary";
import { Paperclip } from "lucide-react";

interface AttachmentData {
  filename: string;
  url: string;
  fileType: string;
  fileSize: number;
}

interface AttachmentUploadProps {
  onUpload: (attachment: AttachmentData) => void;
}

export function AttachmentUpload({
  onUpload,
}: AttachmentUploadProps) {
  return (
    <CldUploadWidget
      signatureEndpoint="/api/cloudinary/sign"
      options={{
        sources: ["local"],
        multiple: true,
        resourceType: "auto",
        clientAllowedFormats: ["pdf", "jpg", "jpeg", "png", "webp"],
        maxFileSize: 10_000_000,
      }}
      onSuccess={(result) => {
        if (
          typeof result.info !== "string" &&
          result.info?.secure_url
        ) {
          console.log("Cloudinary upload result:", result.info);

          const attachment: AttachmentData = {
            filename:
              result.info.original_filename ?? "Untitled",
            url: result.info.secure_url,
            fileType: result.info.format,
            fileSize: result.info.bytes,
          };

          onUpload(attachment);
        }
      }}
    >
      {({ open }) => (
        <button
          type="button"
          onClick={() => open()}
          className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
        >
          <Paperclip className="h-4 w-4" />
          Add attachment
        </button>
      )}
    </CldUploadWidget>
  );
}