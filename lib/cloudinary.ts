import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary on the server.
// The API secret must never be exposed to client-side code.
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function deleteCloudinaryAsset(
  publicId: string,
  resourceType: string
) {
  // Cloudinary's destroy method removes the actual uploaded asset.
  return cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
  });
}