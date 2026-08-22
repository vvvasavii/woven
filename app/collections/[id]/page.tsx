"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { BookmarkCard } from "@/components/dashboard/BookmarkCard";
import { BookmarkDetailDialog } from "@/components/dashboard/BookmarkDetailDialog";
import { EditCollectionDialog } from "@/components/collections/EditCollectionDialog";
import { DeleteCollectionDialog } from "@/components/collections/DeleteCollectionDialog";

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

  // A bookmark can belong to multiple collections.
  collections: {
    collection: {
      id: string;
      name: string;
    };
  }[];
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
  const router = useRouter();

  // Stores the collection and its bookmarks returned by the backend.
  const [collection, setCollection] = useState<Collection | null>(null);

  // Tracks whether the collection is still being fetched.
  const [loading, setLoading] = useState(true);

  // Stores an error message if the API request fails.
  const [error, setError] = useState("");

  // Controls whether the Edit Collection dialog is open.
  const [editOpen, setEditOpen] = useState(false);

  // Tracks whether the PATCH request is running.
  const [updating, setUpdating] = useState(false);

  // Stores an error from the update request.
  const [updateError, setUpdateError] = useState("");

  // Tracks whether the DELETE request is running.
  const [deleting, setDeleting] = useState(false);

  // Controls whether the delete confirmation dialog is open.
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Stores an error from the delete request.
  const [deleteError, setDeleteError] = useState("");

  // Stores the bookmark currently selected for the detail dialog.
  const [selectedBookmark, setSelectedBookmark] = useState<Bookmark | null>(
    null,
  );

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
    return <div className="text-muted-foreground">Loading collection...</div>;
  }

  // Show an error if the collection could not be loaded or was not found.
  if (error || !collection) {
    return (
      <div className="text-muted-foreground">
        {error || "Collection not found"}
      </div>
    );
  }

  async function handleUpdateCollection(data: {
    name: string;
    description: string;
    coverImage: string | null;
  }) {
    setUpdating(true);
    setUpdateError("");

    try {
      const { id } = await params;

      // Send the edited collection data to the backend.
      const response = await fetch(`/api/collections/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          description: data.description || undefined,
          coverImage: data.coverImage || undefined,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to update collection");
      }

      // Replace the displayed collection with the updated data.
      // This updates the page immediately without another GET request.
      setCollection((currentCollection) => {
        if (!currentCollection) {
          return responseData;
        }

        return {
          ...currentCollection,
          ...responseData,
        };
      });

      // Close the dialog after a successful update.
      setEditOpen(false);
    } catch (error) {
      console.error("Error updating collection:", error);

      setUpdateError(
        error instanceof Error ? error.message : "Failed to update collection",
      );
    } finally {
      setUpdating(false);
    }
  }

  async function handleDeleteCollection() {
    setDeleting(true);
    setDeleteError("");

    try {
      // Get the ID of the collection currently being viewed.
      const { id } = await params;

      // Send the delete request to the backend.
      const response = await fetch(`/api/collections/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      // Treat unsuccessful responses as errors.
      if (!response.ok) {
        throw new Error(data.error || "Failed to delete collection");
      }

      // The collection no longer exists, so return to the collections list.
      router.push("/collections");
    } catch (error) {
      console.error("Error deleting collection:", error);

      setDeleteError(
        error instanceof Error ? error.message : "Failed to delete collection",
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Link back to the main Collections page. */}
      <div>
        <Link
          href="/collections"
          className="inline-flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-card/50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Collections</span>
        </Link>

        {/* Display the collection name and description. */}
        <h1 className="mt-4 text-xl sm:text-2xl font-semibold text-foreground">
          {collection.name}
        </h1>

        {collection.description && (
          <p className="mt-2 text-muted-foreground">{collection.description}</p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {/* Opens the existing Edit Collection dialog. */}
          <button
            type="button"
            onClick={() => {
              setUpdateError("");
              setEditOpen(true);
            }}
            className="rounded-lg bg-primary px-3 sm:px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Edit Collection
          </button>

          {/* Opens the delete confirmation dialog. */}
          <button
            type="button"
            onClick={() => {
              setDeleteError("");
              setDeleteOpen(true);
            }}
            className="rounded-lg border-2 border-destructive/60 px-3 sm:px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 hover:border-destructive/80 transition-colors"
          >
            Delete Collection
          </button>
        </div>
      </div>

      <EditCollectionDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        onUpdateCollection={handleUpdateCollection}
        initialData={{
          name: collection.name,
          description: collection.description ?? "",
          coverImage: collection.coverImage,
        }}
        isUpdating={updating}
        error={updateError}
      />

      <DeleteCollectionDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onDeleteCollection={handleDeleteCollection}
        collectionName={collection.name}
        isDeleting={deleting}
        error={deleteError}
      />

      {collection.bookmarks.length > 0 ? (
        <div className="space-y-4">
          {/* Reuse the main BookmarkCard so collection bookmarks behave
        exactly like bookmarks elsewhere in Woven. */}
          {collection.bookmarks.map(({ bookmark }) => (
            <BookmarkCard
              key={bookmark.id}
              id={bookmark.id}
              title={bookmark.title}
              url={bookmark.url}
              domain={bookmark.domain || bookmark.url}
              collection={collection.name}
              favicon={bookmark.favicon}
              isFavorite={bookmark.favorite}
              onClick={() => {
                // The collection API doesn't include the bookmark's collections,
                // so provide the current collection for the detail dialog.
                setSelectedBookmark({
                  ...bookmark,
                  collections: [
                    {
                      collection: {
                        id: collection.id,
                        name: collection.name,
                      },
                    },
                  ],
                });
              }}
            />
          ))}
        </div>
      ) : (
        <div className="text-muted-foreground">
          No bookmarks in this collection yet.
        </div>
      )}

      <BookmarkDetailDialog
        bookmark={selectedBookmark}
        open={selectedBookmark !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedBookmark(null);
          }
        }}
        onBookmarkUpdated={(updatedBookmark) => {
          if (!updatedBookmark) {
            return;
          }

          // Update the bookmark inside the collection immediately.
          setCollection((currentCollection) => {
            if (!currentCollection) {
              return currentCollection;
            }

            return {
              ...currentCollection,
              bookmarks: currentCollection.bookmarks.map(({ bookmark }) =>
                bookmark.id === updatedBookmark.id
                  ? { bookmark: updatedBookmark }
                  : { bookmark },
              ),
            };
          });

          // Keep the dialog showing the updated bookmark.
          setSelectedBookmark(updatedBookmark);
        }}
      />
    </div>
  );
}
