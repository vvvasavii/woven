import { v2 as cloudinary } from "cloudinary";
import { getOrCreateUser } from "@/lib/auth";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    // Make sure only an authenticated Woven user can request an upload signature.
    await getOrCreateUser();

    // Cloudinary's upload widget sends the parameters that need to be signed.
    const { paramsToSign } = await request.json();

    // The Upload Widget adds source=uw to the actual upload request.
    // We must include the same parameter when generating the signature.
    const signatureParams = {
      ...paramsToSign,
      source: "uw",
    };

    // Generate the signature using the server-side Cloudinary API secret.
    const signature = cloudinary.utils.api_sign_request(
      signatureParams,
      process.env.CLOUDINARY_API_SECRET!
    );

    return Response.json({
      signature,
      apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    });
  } catch (error) {
    console.error("Error generating Cloudinary signature:", error);

    if (error instanceof Error && error.message === "Unauthorized") {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    return Response.json(
      { error: "Failed to generate upload signature" },
      { status: 500 }
    );
  }
}

// User
//  ↓
// Clerk authentication
//  ↓
// /api/cloudinary/sign
//  ↓
// verify user
//  ↓
// generate signature
//  ↓
// Cloudinary