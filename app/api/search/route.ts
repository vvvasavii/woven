import { NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const user = await getOrCreateUser();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("q");

    const collections = await prisma.collection.findMany({
      where: {
        userId: user.id, //ensures ownership
        ...(search
          ? {
              name: { 
                contains: search,
                mode: "insensitive",
              },
            }
          : {}),
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const bookmarks = await prisma.bookmark.findMany({
      where: {
        userId: user.id,
        ...(search
          ? {
              OR: [
                {
                  title: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
                {
                  notes: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
              ],
            }
          : {}),
      },
      include: { // Collections and Bookmarks have a many-to-many relationship.
// We include collections when returning bookmarks because we want to show
// which collections each bookmark belongs to.
// We don't include bookmarks when returning collections because this query
// only needs to return the matching collections.
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

    return NextResponse.json({
      collections,
      bookmarks,
    });
  } catch (error) {
    console.error("Error performing global search:", error);

    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    return NextResponse.json(
      { error: "Failed to perform search" },
      { status: 500 },
    );
  }
}

// GLOBAL SEARCH API NOTES:
//
// GET /api/search?q=react performs the Dashboard's global search.
//
// Unlike the other search endpoints, this needs a separate endpoint because
// Dashboard search searches TWO different resources at the same time:
// 1. Collection names
// 2. Bookmark titles and My Notes
//
// Collections Search, Bookmarks Search, and Favorites Search can use their
// existing resource endpoints because each one searches only one resource:
//
// GET /api/collections?q=react
// → searches collections.
//
// GET /api/bookmarks?q=react
// → searches bookmarks.
//
// GET /api/favorites?q=react
// → searches favorite bookmarks.
//
// Dashboard search needs /api/search because it combines the results of
// Collection and Bookmark queries into one response.
//
// The endpoint runs two separate Prisma queries:
// one for collections and one for bookmarks.
//
// Both queries use userId: user.id so users can only search their own data.
//
// Collection search checks the collection name.
//
// Bookmark search checks the bookmark title OR My Notes.
//
// Both searches are case-insensitive.
//
// The response separates the two result types:
//
// {
//   collections: [...],
//   bookmarks: [...]
// }
//
// The bookmark query includes its collections because we want to return
// the collections that each matching bookmark belongs to.
//
// We do not include bookmarks when returning collections because the Dashboard
// search only needs to return the matching collection records.
//
// If no search term is provided, the endpoint returns all of the user's
// collections and bookmarks.

// Existing resource endpoint + ?q
// → when searching ONE resource

// Separate /api/search endpoint
// → when searching MULTIPLE resources together