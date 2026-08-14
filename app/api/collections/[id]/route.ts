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
  { params }: { params: Promise<{ id: string }> }  //params contains the dynamic part of the URL. eg for /api/collections/abc123, params.id will be abc123
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
// /api/collections/[id]
// → Refers to one specific collection.
// → GET: fetch one collection by ID.
// → PATCH: update one collection by ID.
// → DELETE: delete one collection by ID.
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