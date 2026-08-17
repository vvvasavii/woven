import { NextResponse } from "next/server";
import { z } from "zod";
import { getOrCreateUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createBookmarkSchema = z.object({
  url: z.string().url(),
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(1000).optional(),
  domain: z.string().trim().optional(),
  favicon: z.string().url().optional(),
  previewImage: z.string().url().optional(),
  notes: z.string().trim().max(5000).optional(),
  favorite: z.boolean().optional(),
  collectionIds: z.array(z.string()).optional().default([]),
});

export async function POST(request: Request) {
  try {
    const user = await getOrCreateUser(); //gives us the currently authenticated user.

    const body = await request.json();
    const validatedData = createBookmarkSchema.parse(body);

    const { collectionIds, ...bookmarkData } = validatedData; //taking everything except collectionIds and putting it in bookmarkData, and taking collectionIds and putting it in collectionIds.

    if (collectionIds.length > 0) { //only check wehn the bookamr belongs to a collection,ameaning if collecionId is provided, we need to check if the collection exists and belongs to the user. If not, we can skip this check.
      const collections = await prisma.collection.findMany({ //finds all collections that match the collectionIds and belong to the user
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
          { status: 404 },
        );
      }
    }

    const bookmark = await prisma.bookmark.create({ //CREATES BOOKMARKS. //MAP transforms each collection ID into an object used to create
//   BookmarkCollection relationships.
      data: {
        ...bookmarkData,
        userId: user.id,
        collections: {
          create: collectionIds.map((collectionId) => ({
            collectionId,
          })),
        },
      },
      include: {  // Collections and Bookmarks have a many-to-many relationship.
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
    });

    return NextResponse.json(bookmark, { status: 201 });
  } catch (error) {
    console.error("Error creating bookmark:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid bookmark data" },
        { status: 400 },
      );
    }

    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to create bookmark" },
      { status: 500 },
    );
  }
}

// POST BOOKMARK NOTES:
//
// POST /api/bookmarks creates a new Bookmark for the currently authenticated user.
//
// 1. getOrCreateUser()
// → Gets the currently authenticated user from Clerk and Prisma.
//
// 2. request.json()
// → Reads the JSON request body sent by the client.
//
// 3. createBookmarkSchema.parse(body)
// → Zod validates and parses the request data.
// → Invalid data throws a ZodError.
//
// 4. Separate collectionIds from bookmarkData:
//
// const { collectionIds, ...bookmarkData } = validatedData;
//
// → collectionIds contains the IDs of the collections the bookmark belongs to.
// collectionIds is optional because a bookmark can exist independently
// without belonging to any collection.
//
// A bookmark can belong to:
// - zero collections
// - one collection
// - multiple collections
//
// If collectionIds is omitted, Zod defaults it to an empty array.
//
// collectionIds are stored through the BookmarkCollection join table,
// not directly on the Bookmark table.
// → bookmarkData contains all remaining bookmark fields.
// → bookmarkData is NOT a schema field. It is simply a new JavaScript object
//   created using the rest (...) syntax.
//
// Example:
// validatedData = {
//   url,
//   title,
//   notes,
//   favorite,
//   collectionIds: ["abc", "xyz"]
// }
//
// collectionIds = ["abc", "xyz"]
//
// bookmarkData = {
//   url,
//   title,
//   notes,
//   favorite
// }
//
// We separate them because bookmark fields go into the Bookmark table,
// while collectionIds are used to create BookmarkCollection relationships.
//
// 5. Verify collections:
//
// prisma.collection.findMany({
//   where: {
//     id: { in: collectionIds },
//     userId: user.id
//   }
// })
//
// → Finds the requested collections ONLY if they belong to the current user.
// → This prevents a user from adding a bookmark to another user's collection.
//
// 6. collections.length !== collectionIds.length
//
// → Compares how many collections were requested with how many valid,
//   user-owned collections were found.
//
// Example:
// Requested: 3 collections
// Found:     2 collections
// 3 !== 2 → reject the request.
//
// 7. Create the Bookmark:
//
// ...bookmarkData
//
// → Spread syntax copies all properties from bookmarkData into Prisma's
//   data object.
//
// userId: user.id
//
// → Associates the Bookmark with the authenticated user.
// → userId is NOT taken from the client.
//
// 8. Create collection relationships:
//
// collections: {
//   create: collectionIds.map((collectionId) => ({
//     collectionId,
//   })),
// }
//
// → map() converts the collection ID array into objects.
//
// ["abc", "xyz"]
// ↓
// [
//   { collectionId: "abc" },
//   { collectionId: "xyz" }
// ]
//
// → Prisma creates the corresponding BookmarkCollection rows.
//
// One Bookmark can therefore belong to many Collections.
//
// 9. include
//
// include: {
//   collections: {
//     include: {
//       collection: true
//     }
//   }
// }
//
// → Tells Prisma to return related collection data along with the Bookmark.
// → include fetches related records; it does NOT create them.
//
// 10. Response:
//
// NextResponse.json(bookmark, { status: 201 })
//
// → Sends the created Bookmark back to the client.
// → 201 means "Created".
//
// IMPORTANT CONCEPTS:
//
// Rest syntax:
// const { collectionIds, ...bookmarkData } = validatedData;
// → separates one property from the remaining properties.
//
// Spread syntax:
// data: { ...bookmarkData }
// → copies the properties of bookmarkData into the object.
//
// map():
// → transforms each collection ID into an object used to create
//   BookmarkCollection relationships.
//
// include:
// → returns related database records along with the main record.
//
// collections.length !== collectionIds.length:
// → ensures every requested collection exists and belongs to the user.


export async function GET(request: Request) {
  try {
    const user = await getOrCreateUser();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("q");

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

    return NextResponse.json(bookmarks);
  } catch (error) {
    console.error("Error fetching bookmarks:", error);

    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch bookmarks" },
      { status: 500 }
    );
  }
}

// GET retrieves bookmarks belonging to the currently authenticated user.
// It now optionally supports searching through the bookmark title and My Notes
// using the ?q=searchTerm query parameter.
//
// getOrCreateUser() identifies the authenticated user and gives us the corresponding
// database User, including their database ID.


// We read the optional search query from the request URL.
// For example:
// /api/bookmarks?q=react
// gives us search = "react".
//
// If no ?q parameter is provided, search is null and all of the user's bookmarks
// are retrieved.


// Prisma searches the Bookmark table using the user's database ID.
// The userId filter is important because it ensures we only retrieve this user's
// bookmarks rather than returning bookmarks belonging to other users.


// If a search term exists, Prisma additionally searches two fields:
// 1. title
// 2. notes
//
// The OR condition means a bookmark matches if the search term appears in either
// its title OR its My Notes.
//
// For example, searching "hooks" will still find a bookmark if "hooks" appears
// only inside My Notes.
//
// contains performs a partial text match, while mode: "insensitive" makes the
// search case-insensitive.
// Therefore "react", "React", and "REACT" produce the same matching results.


// The search filter is added only when a search term exists.
// This means the same endpoint supports both:
//
// GET /api/bookmarks
// → retrieves all of the user's bookmarks.
//
// GET /api/bookmarks?q=react
// → retrieves only the user's bookmarks whose title or My Notes contain "react".


// The include block retrieves the bookmark's collection relationships.
// Each bookmark can belong to multiple collections through the
// BookmarkCollection join table.
//
// The search does not change this relationship data.
// It only determines which bookmarks are returned.


// orderBy sorts the results by createdAt in descending order,
// so the newest bookmarks appear first.


// NextResponse.json() sends the bookmarks back to the client as a JSON response.


// The catch block handles different types of failures:
// authentication failures return 401,
// and unexpected server errors return 500.