import { NextResponse } from "next/server";
import { z } from "zod";
import { getOrCreateUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const updateBookmarkSchema = z.object({
  url: z.string().url().optional(),
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(1000).optional(),
  domain: z.string().trim().optional(),
  favicon: z.string().url().optional(),
  previewImage: z.string().url().optional(),
  notes: z.string().trim().max(5000).optional(),
  favorite: z.boolean().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getOrCreateUser();
    const { id } = await params;

    const body = await request.json();
    const validatedData = updateBookmarkSchema.parse(body);

    const bookmark = await prisma.bookmark.updateMany({
      where: {
        id,
        userId: user.id,
      },
      data: validatedData,
    });

    if (bookmark.count === 0) {
      return NextResponse.json(
        { error: "Bookmark not found" },
        { status: 404 }
      );
    }

    const updatedBookmark = await prisma.bookmark.findUnique({
      where: {
        id,
      },
      include: {
        collections: {
          include: {
            collection: true,
          },
        },
      },
    });

    return NextResponse.json(updatedBookmark);
  } catch (error) {
    console.error("Error updating bookmark:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid bookmark data" },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update bookmark" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getOrCreateUser();
    const { id } = await params;

    const bookmark = await prisma.bookmark.deleteMany({
      where: {
        id,
        userId: user.id,
      },
    });

    if (bookmark.count === 0) {
      return NextResponse.json(
        { error: "Bookmark not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Bookmark deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting bookmark:", error);

    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Failed to delete bookmark" },
      { status: 500 }
    );
  }
}