import { NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getOrCreateUser();

    const favorites = await prisma.bookmark.findMany({
      where: {
        userId: user.id,
        favorite: true,
      },
      include: {
        collections: {
          include: {
            collection: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(favorites);
  } catch (error) {
    console.error("Error fetching favorites:", error);

    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch favorites" },
      { status: 500 },
    );
  }
}

// FAVORITES API NOTES:
//
// GET /api/favorites is responsible only for retrieving the current user's
// favorite bookmarks.
//
// We do NOT need separate POST or DELETE endpoints for favorites because
// favorite status is already a field on the Bookmark model:
//
// favorite Boolean @default(false)
//
// Creating/removing a favorite is handled through the existing:
//
// PATCH /api/bookmarks/:id
//
// To mark a bookmark as a favorite:
// { favorite: true }
//
// To remove it from favorites:
// { favorite: false }
//
// Therefore:
//
// PATCH /api/bookmarks/:id
// → changes the favorite status of a bookmark.
//
// GET /api/favorites
// → retrieves all bookmarks belonging to the current user where favorite is true.
//
// The GET query uses:
//
// where: {
//   userId: user.id,
//   favorite: true,
// }
//
// userId: user.id ensures that only the authenticated user's own bookmarks
// are returned.
//
// favorite: true filters those bookmarks to only the ones currently marked
// as favorites.
//
// Favorites are independent of collection membership. A bookmark can be
// favorited whether it belongs to zero, one, or multiple collections.
//
// The endpoint includes the bookmark's collections so the response has the
// same related collection information as GET /api/bookmarks.