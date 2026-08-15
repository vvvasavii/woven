import { NextResponse } from "next/server";
import { z } from "zod";
import { getOrCreateUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const updateCollectionSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  description: z.string().trim().max(500).optional(),
  coverImage: z.string().url().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }  //params contains the dynamic part of the URL. eg for /api/collections/abc123, params.id will be abc123 //promise promises that the we will eventually get the params object, which contains the dynamic part of the URL. it makes us wait for the params to be resolved before we can use it. this is important because we need the id to update the correct collection.
) {
  try {
    const user = await getOrCreateUser();
    const { id } = await params; //destructuring the id from params

    const body = await request.json();
    const validatedData = updateCollectionSchema.parse(body);

    const collection = await prisma.collection.updateMany({  //using updateMany instead of update to ensure that we only update the collection if it belongs to the authenticated user. This prevents users from updating collections that don't belong to them.
      where: {
        id,
        userId: user.id,
      },
      data: validatedData,
    });

    if (collection.count === 0) {
      return NextResponse.json(
        { error: "Collection not found" },
        { status: 404 }
      );
    }

    const updatedCollection = await prisma.collection.findUnique({  //is simply fetching the collection again after we updated it to return the updated data to the client. 
      where: {
        id,
      },
    });

    return NextResponse.json(updatedCollection);
  } catch (error) {
    console.error("Error updating collection:", error);

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
      { error: "Failed to update collection" },
      { status: 500 }
    );
  }
}

// This is a PATCH Route Handler for partially updating a collection. I first define a Zod schema where the fields are optional because PATCH allows partial updates.
//  The incoming request is authenticated using getOrCreateUser(). I then extract the collection ID from the dynamic route parameter and read the JSON request body. The body is validated using Zod.

// I use Prisma's updateMany() with two conditions: the collection ID and the authenticated user's ID.
//  This ensures that a user can only update their own collection. If no record matches both conditions, we return a 404. If the update succeeds, we query the updated collection using findUnique() and return it as JSON.

// The catch block handles validation errors with 400, authentication errors with 401, and unexpected server errors with 500


// ROUTE / DYNAMIC URL NOTE:
//
// A dynamic URL is NOT specific to PATCH or PUT.
// It is used when we need to identify a specific resource.
//
// /api/collections
// → Refers to the collection of resources as a whole.
// → GET: fetch all collections for the current user.
// → POST: create a new collection.
//

//
// IMPORTANT:
// The [id] is the RESOURCE ID, not the user's ID.
// The current user is identified through Clerk authentication.
//
// Rule to remember:
// "If the operation needs to identify one specific resource,
// use its ID in the URL. If it operates on the resource
// collection as a whole, no dynamic ID is needed."
//
// PATCH/PUT do NOT automatically require dynamic URLs.
// The URL depends on whether we are targeting one specific resource.


export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getOrCreateUser();
    const { id } = await params;

    const collection = await prisma.collection.deleteMany({
      where: {
        id,
        userId: user.id,
      },
    });

    if (collection.count === 0) {
      return NextResponse.json(
        { error: "Collection not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Collection deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting collection:", error);

    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Failed to delete collection" },
      { status: 500 }
    );
  }
}

// DELETE + DYNAMIC URL NOTE:
//
// DELETE /api/collections/:id
//
// We use a dynamic URL because we are deleting ONE specific collection.
// The [id] identifies which collection the request is targeting.
//
// Example:
//
// DELETE /api/collections/abc123
//
// Here:
// - /api/collections = the collection resource
// - abc123 = the ID of the specific collection we want to delete
//
// The [id] does NOT mean we are deleting only part of a collection.
// The entire collection record is deleted.
//
// The HTTP method tells us WHAT operation we are performing,
// while the dynamic ID tells us WHICH resource we are performing it on.
//
// /api/collections
// → Collection resource as a whole
//
// POST /api/collections
// → Create a new collection
//
// GET /api/collections
// → Get all collections belonging to the current user
//
// /api/collections/:id
// → One specific collection
//
// PATCH /api/collections/:id
// → Update that specific collection
//
// DELETE /api/collections/:id
// → Delete that specific collection
//
//
// IMPORTANT:
//
// The ID in the URL is the COLLECTION ID, not the USER ID.
//
// The current user is identified through Clerk authentication.
// We use both values when modifying or deleting a collection:
//
// id: requested collection ID
// userId: authenticated user's ID
//
// This prevents a user from modifying or deleting another user's collection.
//
// In other words:
//
// Clerk authentication
//        ↓
// identifies the current user
//
// Dynamic URL [id]
//        ↓
// identifies the target collection
//
// id + userId
//        ↓
// ensures the target collection belongs to the current user
//
//
// DELETE + MANY-TO-MANY RELATIONSHIP:
//
// A collection can contain many bookmarks,
// and a bookmark can belong to many collections.
//
// Therefore, deleting a collection should NOT delete the bookmarks.
//
// Our Prisma schema uses:
//
// onDelete: Cascade
//
// on the Collection → BookmarkCollection relationship.
//
// So when a collection is deleted:
//
// Collection
//     ↓
// deleted
//
// BookmarkCollection relationships
//     ↓
// deleted automatically
//
// Bookmark records
//     ↓
// remain in the database
//
// This is important because the same bookmark may still belong
// to other collections.
//
// Example:
//
// Bookmark: React Documentation
// Collections: React, Frontend, Interview Prep
//
// If the React collection is deleted:
//
// React collection
//     ↓
// deleted
//
// React ↔ React Documentation relationship
//     ↓
// deleted
//
// React Documentation bookmark
//     ↓
// remains because it can still belong to Frontend and Interview Prep.