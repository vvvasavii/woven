import { NextResponse } from "next/server";
import { deleteCloudinaryAsset } from "@/lib/cloudinary";

import { getOrCreateUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
      attachmentId: string;
    }>;
  },
) {
  try {
    // Make sure the request comes from an authenticated Woven user.
    const user = await getOrCreateUser();

    const { id: bookmarkId, attachmentId } = await params;

    // Make sure the bookmark belongs to the current user.
    const bookmark = await prisma.bookmark.findFirst({
      where: {
        id: bookmarkId,
        userId: user.id,
      },
    });

    if (!bookmark) {
      return NextResponse.json(
        { error: "Bookmark not found" },
        { status: 404 },
      );
    }

    // Make sure the attachment belongs to the current user.
    const attachment = await prisma.attachment.findFirst({
      where: {
        id: attachmentId,
        userId: user.id,
      },
    });

    if (!attachment) {
      return NextResponse.json(
        { error: "Attachment not found" },
        { status: 404 },
      );
    }

    // Find the specific relationship between this bookmark and attachment.
    const relationship = await prisma.bookmarkAttachment.findUnique({
      where: {
        bookmarkId_attachmentId: {
          bookmarkId,
          attachmentId,
        },
      },
    });

    if (!relationship) {
      return NextResponse.json(
        { error: "Attachment is not attached to this bookmark" },
        { status: 404 },
      );
    }

    // Remove the attachment from this bookmark.
    await prisma.bookmarkAttachment.delete({
      where: {
        bookmarkId_attachmentId: {
          bookmarkId,
          attachmentId,
        },
      },
    });

    // Check whether this attachment is still attached to any other bookmark.
    const remainingRelationships = await prisma.bookmarkAttachment.count({
      where: {
        attachmentId,
      },
    });

    // If no bookmarks use the attachment anymore,
    // remove the database record as well.
    if (remainingRelationships === 0) {
      // The attachment is no longer used by any bookmark,
      // so remove its database record.
      await prisma.attachment.delete({
        where: {
          id: attachmentId,
        },
      });

      // The attachment is now orphaned, so remove the actual
      // file from Cloudinary as well.
      const cloudinaryResult = await deleteCloudinaryAsset(
        attachment.cloudinaryPublicId,
        attachment.cloudinaryResourceType,
      );

      console.log("Cloudinary deletion result:", cloudinaryResult);
    }

    return NextResponse.json(
      {
        message: "Attachment removed from bookmark",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error removing attachment from bookmark:", error);

    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to remove attachment from bookmark" },
      { status: 500 },
    );
  }
}
