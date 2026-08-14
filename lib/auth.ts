import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "./prisma";

export async function getOrCreateUser() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      clerkId: userId,
    },
  });

  if (existingUser) {
    return existingUser;
  }

  const clerkUser = await currentUser();

  if (!clerkUser) {
    throw new Error("Unable to retrieve Clerk user");
  }

  const email = clerkUser.emailAddresses[0]?.emailAddress;

  if (!email) {
    throw new Error("Clerk user does not have an email address");
  }

  return prisma.user.create({
    data: {
      clerkId: userId,
      name: [clerkUser.firstName, clerkUser.lastName]
        .filter(Boolean)
        .join(" ") || null,
      email,
    },
  });
}

// Gets the currently authenticated Clerk user and connects them
// to their corresponding User record in our PostgreSQL database.
//
// 1. auth() gets the current Clerk user's ID.
// 2. If there is no user, throw an Unauthorized error.
// 3. Prisma checks whether a User with that clerkId already exists.
// 4. If the user exists, return the existing database user.
// 5. If not, currentUser() gets the user's Clerk profile data.
// 6. Extract the user's name and email from Clerk.
// 7. Prisma creates a new User record in PostgreSQL.
//
// This creates the bridge between Clerk's identity system
// and Woven's own User table, which we will use for
// ownership and authorization of Woven's data.