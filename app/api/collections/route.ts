import { NextResponse } from "next/server";
import { z } from "zod";
import { getOrCreateUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createCollectionSchema = z.object({
  //zod validatiion conditions for creating a collection
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(500).optional(),
  coverImage: z.string().url().optional(),
});

export async function GET() {
  try {
    const user = await getOrCreateUser();

    const collections = await prisma.collection.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(collections);
  } catch (error) {
    console.error("Error fetching collections:", error);

    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch collections" },
      { status: 500 }
    );
  }
}

// GET retrieves all collections belonging to the currently authenticated user.
// getOrCreateUser() identifies the authenticated user and gives us the corresponding database User.

// Prisma then searches the Collection table using the user's database ID.
// The userId filter is important because it ensures we only retrieve this user's collections,
// rather than returning collections belonging to other users.

// orderBy sorts the results by createdAt in descending order,
// so the newest collections appear first.

// NextResponse.json() sends the collections back to the client as a JSON response.

// The catch block handles different types of failures:
// authentication failures return 401,
// and unexpected server errors return 500.


export async function POST(request: Request) {
  try {
    const user = await getOrCreateUser();

    const body = await request.json(); //Thiss si simply how we read the data sent by the frontend in the HTTP request body.

    const validatedData = createCollectionSchema.parse(body);

    const collection = await prisma.collection.create({
      data: {
        name: validatedData.name,
        description: validatedData.description || null,
        coverImage: validatedData.coverImage || null,
        userId: user.id,
      },
    });

    return NextResponse.json(collection, { status: 201 }); //NextResponse is Next.js's way of creating the HTTP response that we send back to the client.basically the user sends a request to my server rught,then the server sends a reposne back. tahst what it is amd 201 means craeted successfully
  } catch (error) {
    console.error("Error creating collection:", error);

    if (error instanceof z.ZodError) { //Zod validation error
      return NextResponse.json(
        { error: "Invalid collection data" },
        { status: 400 },
      );
    }

    if (error instanceof Error && error.message === "Unauthorized") { //Authentication error
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json( //Unexpected server error
      { error: "Failed to create collection" },
      { status: 500 },
    );
  }
}

//my revsion notes:
// I created a POST Route Handler for creating collections. First, I define a Zod schema to validate the incoming collection data.
// The name is required and limited to 100 characters, the description is optional and limited to 500 characters, and an optional cover image must be a valid URL.

// The POST handler receives the HTTP request. getOrCreateUser() identifies the authenticated user and gives us the corresponding database User. request.json() reads the JSON body sent by the client.
//   I then validate that data using Zod.

// Once validated, Prisma creates a new Collection record and associates it with the authenticated user's database ID. 
// NextResponse.json() sends the result back to the client. The status code 201 indicates that the resource was successfully created.

// The catch block handles different types of failures: Zod validation errors return 400, authentication failures return 401, and unexpected server errors return 500.

// Frontend
//    ↓
// HTTP Request
//    ↓
// request.json()
//    ↓
// Zod validation
//    ↓
// Clerk user
//    ↓
// Prisma
//    ↓
// PostgreSQL
//    ↓
// NextResponse.json()
//    ↓
// Frontend
