"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// Represents the bookmark data returned by the collection API.
interface Bookmark {
  id: string;
  title: string;
  url: string;
  description: string | null;
  domain: string | null;
  favicon: string | null;
  previewImage: string | null;
  notes: string | null;
  favorite: boolean;
}

// Represents the collection returned by the API.
// bookmarks contains the BookmarkCollection relationships,
// with the actual bookmark inside the bookmark property.
interface Collection {
  id: string;
  name: string;
  description: string | null;
  coverImage: string | null;
  bookmarks: {
    bookmark: Bookmark;
  }[];
}

export default function CollectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Stores the collection and its bookmarks returned by the backend.
  const [collection, setCollection] = useState<Collection | null>(null);

  // Tracks whether the collection is still being fetched.
  const [loading, setLoading] = useState(true);

  // Stores an error message if the API request fails.
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchCollection() {
      try {
        // Get the collection ID from the dynamic route.
        const { id } = await params;

        // Fetch the specific collection and its bookmarks.
        const response = await fetch(`/api/collections/${id}`);

        // Treat unsuccessful HTTP responses as errors.
        if (!response.ok) {
          throw new Error("Failed to fetch collection");
        }

        // Convert the JSON response into JavaScript data.
        const data = await response.json();

        // Store the collection so React can display it.
        setCollection(data);
      } catch (error) {
        console.error("Error fetching collection:", error);

        // Show an error message if the request fails.
        setError("Failed to load collection");
      } finally {
        // Stop showing the loading state after the request finishes.
        setLoading(false);
      }
    }

    // Fetch the collection when the page loads.
    fetchCollection();
  }, [params]);

  // Show a loading message while the API request is running.
  if (loading) {
    return (
      <div className="text-muted-foreground">
        Loading collection...
      </div>
    );
  }

  // Show an error if the collection could not be loaded or was not found.
  if (error || !collection) {
    return (
      <div className="text-muted-foreground">
        {error || "Collection not found"}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Link back to the main Collections page. */}
      <div>
        <Link
          href="/collections"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to Collections
        </Link>

        {/* Display the collection name and description. */}
        <h1 className="mt-4 text-2xl font-semibold text-foreground">
          {collection.name}
        </h1>

        {collection.description && (
          <p className="mt-2 text-muted-foreground">
            {collection.description}
          </p>
        )}
      </div>

      {collection.bookmarks.length > 0 ? (
        <div className="space-y-4">
          {/* Display each bookmark belonging to this collection. */}
          {collection.bookmarks.map(({ bookmark }) => (
            <div
              key={bookmark.id}
              className="bg-background border border-border rounded-lg p-4"
            >
              <h2 className="font-medium text-foreground">
                {bookmark.title}
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                {bookmark.domain || bookmark.url}
              </p>

              {/* Display My Notes only when the bookmark has notes. */}
              {bookmark.notes && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {bookmark.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        // Displayed when the collection contains no bookmarks.
        <div className="text-muted-foreground">
          No bookmarks in this collection yet.
        </div>
      )}
    </div>
  );
}