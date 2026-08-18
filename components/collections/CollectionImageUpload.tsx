"use client";

import { CldUploadWidget } from "next-cloudinary";
import { ImagePlus, X } from "lucide-react";

interface CollectionImageUploadProps {
  // Stores the Cloudinary URL of the selected image.
  // null means that no image has been selected.
  value: string | null;

  // Sends the uploaded image URL back to the parent component.
  // The parent will later use this URL when creating the collection.
  onChange: (url: string | null) => void;
}

export function CollectionImageUpload({
  value,
  onChange,
}: CollectionImageUploadProps) {
  return (
    <div className="space-y-3">
      {/* 
        CldUploadWidget provides the Cloudinary upload functionality.
        signatureEndpoint tells Cloudinary where our Next.js server
        generates the secure upload signature.
      */}
      <CldUploadWidget
        signatureEndpoint="/api/cloudinary/sign"
        options={{
          // Only allow users to select files from their local device.
          sources: ["local"],

          // A collection can have only one cover image.
          multiple: false,

          // Only images are allowed to be uploaded.
          resourceType: "image",

          // Restrict uploads to these image formats.
          clientAllowedFormats: ["jpg", "jpeg", "png", "webp", "avif"],

          // Limit the image size to 5 MB.
          maxFileSize: 5_000_000,
        }}
        onSuccess={(result) => {
          /*
            Cloudinary calls this function after the upload succeeds.

            result.info contains information about the uploaded file.
            secure_url is the HTTPS URL where Cloudinary stores the image.
          */
          if (
            typeof result.info !== "string" &&
            result.info?.secure_url
          ) {
            // Send the Cloudinary image URL to the parent component.
            onChange(result.info.secure_url);
          }
        }}
      >
        {({ open }) => (
          <>
            {value ? (
              /*
                If an image URL already exists, show the uploaded image
                instead of showing the upload button again.
              */
              <div className="relative overflow-hidden rounded-lg border border-border">
                <img
                  src={value}
                  alt="Collection cover preview"
                  className="h-40 w-full object-cover"
                />

                {/* 
                  Remove the selected image from the form.
                  This only removes the URL from React state.
                  It does not delete the image from Cloudinary.
                */}
                <button
                  type="button"
                  onClick={() => onChange(null)}
                  className="absolute top-2 right-2 rounded-full bg-background/90 p-1.5 text-foreground shadow-sm hover:bg-background"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Remove image</span>
                </button>
              </div>
            ) : (
              /*
                No image has been selected yet.
                Clicking this button opens the Cloudinary upload widget.
              */
              <button
                type="button"
                onClick={() => open()}
                className="flex h-40 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-background text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
              >
                <ImagePlus className="h-6 w-6" />

                <span className="text-sm font-medium">
                  Upload cover image
                </span>

                <span className="text-xs">
                  JPG, PNG, WebP or AVIF · Max 5 MB
                </span>
              </button>
            )}
          </>
        )}
      </CldUploadWidget>
    </div>
  );
}

/*
CLOUDINARY IMAGE UPLOAD FLOW:

1. User opens the Create Collection dialog.
        ↓
2. User clicks "Upload cover image".
        ↓
3. CldUploadWidget opens the Cloudinary upload interface.
        ↓
4. Cloudinary needs a signature because we are using signed uploads.
        ↓
5. The widget contacts:
   POST /api/cloudinary/sign
        ↓
6. Our Next.js server authenticates the user using Clerk.
        ↓
7. The server uses the Cloudinary API Secret to generate
   a signature for the upload request.
        ↓
8. The server sends the signature back to the browser.
   
   The API Secret NEVER goes to the browser.
        ↓
9. The browser uses the signed request to upload the image
   directly to Cloudinary.
        ↓
10. Cloudinary stores the image and returns its secure_url.
        ↓
11. onSuccess() receives the Cloudinary response.
        ↓
12. onChange(secure_url) sends the image URL to the parent
    Create Collection form.
        ↓
13. The parent stores the URL in React state.
        ↓
14. The image preview is displayed using that URL.
        ↓
15. When the user submits the collection form,
    the URL is sent to:
    
    POST /api/collections
        ↓
16. Prisma stores that URL in the Collection.coverImage field.
        ↓
17. PostgreSQL stores the collection record.
        ↓
18. Later, Woven can use coverImage to display the
    collection's cover image.

IMPORTANT:
Cloudinary stores the actual image.
PostgreSQL stores only the Cloudinary image URL.

So:

Cloudinary → actual image file
PostgreSQL → URL pointing to that image
Woven frontend → displays the image using that URL
*/