"use client";

import { CldUploadWidget } from "next-cloudinary";
import { ImagePlus, X, RefreshCw } from "lucide-react";

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
              <div className="relative overflow-hidden rounded-lg border-2 border-border/60 shadow-sm">
                <img
                  src={value}
                  alt="Collection cover preview"
                  className="h-44 w-full object-cover"
                />

                {/* Subtle overlay for better text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

                {/* Replace button */}
                <button
                  type="button"
                  onClick={() => open()}
                  className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity hover:opacity-100 group"
                >
                  <RefreshCw className="h-5 w-5 text-white" />
                  <span className="text-sm font-medium text-white">Replace image</span>
                </button>

                {/* 
                  Remove the selected image from the form.
                  This only removes the URL from React state.
                  It does not delete the image from Cloudinary.
                */}
                <button
                  type="button"
                  onClick={() => onChange(null)}
                  className="absolute top-3 right-3 rounded-full bg-background/95 p-2 text-foreground shadow-md hover:bg-background transition-colors"
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
                className="group relative flex h-44 w-full flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-border/60 bg-card/30 transition-all hover:border-primary/40 hover:bg-card/50 hover:shadow-sm"
              >
                {/* Subtle pattern overlay */}
                <div className="absolute inset-0 opacity-[0.03]" 
                     style={{
                       backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
                       backgroundSize: '24px 24px'
                     }}
                />
                
                <div className="relative flex flex-col items-center gap-3 text-muted-foreground group-hover:text-foreground transition-colors">
                  <div className="rounded-full bg-primary/10 p-3 group-hover:bg-primary/20 transition-colors">
                    <ImagePlus className="h-6 w-6 text-primary" />
                  </div>
                  
                  <div className="text-center space-y-1">
                    <span className="text-sm font-medium text-foreground">
                      Upload cover image
                    </span>

                    <span className="text-xs text-muted-foreground">
                      JPG, PNG, WebP or AVIF · Max 5 MB
                    </span>
                  </div>
                </div>
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