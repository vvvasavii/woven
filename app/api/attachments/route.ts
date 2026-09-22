import { NextResponse } from "next/server";
import { z } from "zod";

import { getOrCreateUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const attachmentSchema = z.object({
  filename: z.string().min(1),
  url: z.string().url(),
  fileType: z.string().min(1),
  fileSize: z.number().int().positive(),
});

export async function POST(request: Request) {
  try {
    const user = await getOrCreateUser();

    const body = await request.json();

    const result = attachmentSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid attachment data" },
        { status: 400 }
      );
    }

    const attachment = await prisma.attachment.create({
      data: {
        filename: result.data.filename,
        url: result.data.url,
        fileType: result.data.fileType,
        fileSize: result.data.fileSize,
        userId: user.id,
      },
    });

    return NextResponse.json(attachment, { status: 201 });
  } catch (error) {
    console.error("Error creating attachment:", error);

    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create attachment" },
      { status: 500 }
    );
  }
}