import { NextResponse } from "next/server";
import { z } from "zod";
import { getOrCreateUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const updateBookmarkCollectionsSchema = z.object({
  collectionIds: z.array(z.string()),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getOrCreateUser();
    const { id } = await params;

    const body = await request.json();
    const { collectionIds } =
      updateBookmarkCollectionsSchema.parse(body);

    const bookmark = await prisma.bookmark.findFirst({ //findfirst is used to Find the first Bookmark that matches the filter. so we are checking if the bookmark exists and belongs to the authenticated user. If it doesn't, we return a 404 error.
      where: {
        id,
        userId: user.id,
      },
    });

    if (!bookmark) {
      return NextResponse.json(
        { error: "Bookmark not found" },
        { status: 404 }
      );
    }

    const collections = await prisma.collection.findMany({
      where: {
        id: {
          in: collectionIds,
        },
        userId: user.id,
      },
    });

    if (collections.length !== collectionIds.length) {
      return NextResponse.json(
        { error: "One or more collections not found" },
        { status: 404 }
      );
    }

    await prisma.$transaction([ //we are doing two operations here. transaction ensures that both operations are executed as a single unit of work. If either operation fails, the entire transaction is rolled back, and no changes are made to the database.
      prisma.bookmarkCollection.deleteMany({ //first we delete all the existing relationships between the bookmark and collections from the bookmarkcollection join table
        where: {
          bookmarkId: id,
        },
      }),

      prisma.bookmarkCollection.createMany({ //then we create new relationships between the bookmark and the collections specified in the request body. This is done by creating new records in the bookmarkcollection join table.
        data: collectionIds.map((collectionId) => ({
          bookmarkId: id,
          collectionId,
        })),
      }),
    ]);

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
    console.error("Error updating bookmark collections:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid collection data" },
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
      { error: "Failed to update bookmark collections" },
      { status: 500 }
    );
  }
}

// PATCH BOOKMARK COLLECTIONS NOTES:
//
// ROUTE:
// PATCH /api/bookmarks/:id/collections
//
// WHY A SEPARATE FILE?
//
// This endpoint modifies the relationships between a Bookmark and Collections,
// not the Bookmark's own fields.
//
// Regular PATCH:
// /api/bookmarks/:id
// → Updates Bookmark fields such as title, notes, favorite, URL, etc.
//
// This PATCH:
// /api/bookmarks/:id/collections
// → Updates the BookmarkCollection join-table relationships.
//
// We use a separate route because these are two different resources/operations.
// The Bookmark itself and its collection relationships are stored separately.
//
// The route structure is:
//
// app/api/bookmarks/
// ├── route.ts
// │   ├── POST /api/bookmarks
// │   └── GET  /api/bookmarks
// │
// └── [id]/
//     ├── route.ts
//     │   ├── PATCH  /api/bookmarks/:id
//     │   └── DELETE /api/bookmarks/:id
//     │
//     └── collections/
//         └── route.ts
//             └── PATCH /api/bookmarks/:id/collections
//
//
// 1. async + await
//
// The handler is async because authentication and database operations
// are asynchronous and return Promises.
//
// await waits for the Promise to resolve and gives us the actual result.
//
// Example:
// getOrCreateUser() → Promise<User>
// await getOrCreateUser() → User
//
//
// 2. getOrCreateUser()
//
// Gets the currently authenticated user through Clerk and Prisma.
//
// user.id is used to make sure the bookmark and collections belong
// to the authenticated user.
//
//
// 3. params
//
// The [id] in the URL is the bookmark ID.
//
// Example:
// /api/bookmarks/abc123/collections
//
// params = { id: "abc123" }
//
// const { id } = await params;
// → extracts the bookmark ID.
//
//
// 4. request.json()
//
// Reads the JSON body sent by the client.
//
// It gives us the request BODY, not the entire HTTP request.
//
// Example body:
// {
//   "collectionIds": ["collection1", "collection2"]
// }
//
//
// 5. collectionIds
//
// We extract collectionIds from the validated request data.
//
// collectionIds contains the IDs of the collections that the bookmark
// should belong to.
//
// An empty array is valid:
//
// {
//   "collectionIds": []
// }
//
// This means the bookmark should belong to no collections.
//
//
// 6. Find the bookmark
//
// findFirst() checks:
//
// id = requested bookmark ID
// AND
// userId = authenticated user's ID
//
// This verifies that the bookmark exists AND belongs to the current user.
//
// If no bookmark matches, return 404.
//
//
// 7. Find the collections
//
// findMany() is used because a bookmark can belong to multiple collections.
//
// We find collections whose IDs are in collectionIds AND whose userId
// matches the authenticated user.
//
// This prevents a user from attaching their bookmark to another user's collection.
//
//
// 8. collections.length !== collectionIds.length
//
// Compares:
//
// Number of requested collection IDs
// VS
// Number of valid, user-owned collections found
//
// Example:
//
// Requested: 3
// Found:     2
//
// 3 !== 2 → at least one collection is invalid or belongs to another user.
// → Return 404.
//
//
// 9. Prisma transaction
//
// The transaction contains two database operations:
//
// 1. Delete the bookmark's existing BookmarkCollection relationships.
// 2. Create the new BookmarkCollection relationships.
//
// These operations are treated as one atomic unit.
//
// If both succeed → changes are committed.
// If something fails → changes are rolled back.
//
// This prevents the database from being left in a half-updated state.
//
//
// Example:
//
// BEFORE:
// Bookmark A → Frontend
// Bookmark A → Learning
//
// Request:
// collectionIds = ["Frontend", "Interview"]
//
// Transaction:
// DELETE old relationships
// CREATE new relationships
//
// AFTER:
// Bookmark A → Frontend
// Bookmark A → Interview
//
//
// IMPORTANT:
// We are NOT deleting or creating the actual Bookmark or Collection records.
// We are only changing rows in the BookmarkCollection join table.
//
//
// 10. findUnique() after the transaction
//
// After changing the relationships, we fetch the bookmark again.
//
// The earlier bookmark variable was fetched BEFORE the relationship changes,
// so we query again to get the updated state.
//
// findUnique() is appropriate here because Bookmark.id is unique.
//
//
// 11. include
//
// include tells Prisma to return related records along with the Bookmark.
//
// collections:
// → includes the BookmarkCollection relationships.
//
// collection: true
// → includes the actual Collection record behind each relationship.
//
// So the response contains the updated bookmark and its current collections.
//
//
// 12. Response
//
// NextResponse.json(updatedBookmark)
//
// → Sends the updated bookmark and its collection information back to the client.
//
//
// MAIN FLOW:
//
// Authenticate user
//       ↓
// Get bookmark ID from URL
//       ↓
// Read + validate collectionIds
//       ↓
// Verify bookmark belongs to user
//       ↓
// Verify all collections belong to user
//       ↓
// Transaction:
//   delete old relationships
//   create new relationships
//       ↓
// Fetch updated bookmark + collections
//       ↓
// Return JSON
//
//
// IMPORTANT CONCEPT:
//
// BookmarkCollection is the join table between Bookmark and Collection.
//
// Therefore, changing a bookmark's collections means changing
// BookmarkCollection rows, not changing the Bookmark row itself.