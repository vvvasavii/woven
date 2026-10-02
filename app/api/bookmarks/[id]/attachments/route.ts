import { NextResponse } from "next/server";
import { z } from "zod";

import { getOrCreateUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const attachmentSchema = z.object({
  attachmentId: z.string().min(1),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getOrCreateUser();

    const { id: bookmarkId } = await params;

    const body = await request.json();

    const result = attachmentSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid attachment data" },
        { status: 400 }
      );
    }

    const { attachmentId } = result.data;

    const bookmark = await prisma.bookmark.findFirst({
      where: {
        id: bookmarkId,
        userId: user.id,
      },
    });

    if (!bookmark) {
      return NextResponse.json(
        { error: "Bookmark not found" },
        { status: 404 }
      );
    }

    const attachment = await prisma.attachment.findFirst({
      where: {
        id: attachmentId,
        userId: user.id,
      },
    });

    if (!attachment) {
      return NextResponse.json(
        { error: "Attachment not found" },
        { status: 404 }
      );
    }

    const bookmarkAttachment =
      await prisma.bookmarkAttachment.create({
        data: {
          bookmarkId,
          attachmentId,
        },
      });

    return NextResponse.json(bookmarkAttachment, { status: 201 });
  }       catch (error) {
    console.error("Error attaching file to bookmark:", error);

    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Prisma uses error code P2002 when a unique constraint is violated.
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Attachment is already attached to this bookmark" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to attach file to bookmark" },
      { status: 500 }
    );
  }
}
