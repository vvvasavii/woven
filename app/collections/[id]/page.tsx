"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { CollectionImageUpload } from "@/components/collections/CollectionImageUpload";

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
  const router = useRouter();

  // Stores the collection and its bookmarks returned by the backend.
  const [collection, setCollection] = useState<Collection | null>(null);

  // Tracks whether the collection is still being fetched.
  const [loading, setLoading] = useState(true);

  // Stores an error message if the API request fails.
  const [error, setError] = useState("");

  // Controls whether the Edit Collection dialog is open.
  const [editOpen, setEditOpen] = useState(false);

  // Stores the edited collection name.
  const [editName, setEditName] = useState("");

  // Stores the edited collection description.
  const [editDescription, setEditDescription] = useState("");

  // Stores the edited Cloudinary cover image URL.
  const [editCoverImage, setEditCoverImage] = useState<string | null>(null);

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

  async function handleUpdateCollection(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

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
          name: editName,
          description: editDescription || undefined,
          coverImage: editCoverImage || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update collection");
      }

      // Replace the displayed collection with the updated data.
      // This updates the page immediately without another GET request.
      setCollection((currentCollection) => {
        if (!currentCollection) {
          return data;
        }

        return {
          ...currentCollection,
          ...data,
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
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to Collections
        </Link>

        {/* Display the collection name and description. */}
        <h1 className="mt-4 text-2xl font-semibold text-foreground">
          {collection.name}
        </h1>

        {collection.description && (
          <p className="mt-2 text-muted-foreground">{collection.description}</p>
        )}

        <div className="mt-4 flex items-center gap-2">
          {/* Opens the existing Edit Collection dialog. */}
          <button
            type="button"
            onClick={() => {
              // Pre-fill the edit form with the current collection values.
              setEditName(collection.name);
              setEditDescription(collection.description ?? "");
              setEditCoverImage(collection.coverImage);
              setUpdateError("");
              setEditOpen(true);
            }}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
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
            className="rounded-lg border border-destructive px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
          >
            Delete Collection
          </button>
        </div>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Collection</DialogTitle>

            <DialogDescription>
              Update the details of your collection.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdateCollection} className="space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="edit-collection-name"
                className="text-sm font-medium"
              >
                Name
              </label>

              <input
                id="edit-collection-name"
                value={editName}
                onChange={(event) => setEditName(event.target.value)}
                maxLength={100}
                required
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="edit-collection-description"
                className="text-sm font-medium"
              >
                Description
              </label>

              <textarea
                id="edit-collection-description"
                value={editDescription}
                onChange={(event) => setEditDescription(event.target.value)}
                maxLength={500}
                rows={3}
                className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Cover Image</label>

              <CollectionImageUpload
                value={editCoverImage}
                onChange={setEditCoverImage}
              />
            </div>

            {updateError && (
              <p className="text-sm text-destructive">{updateError}</p>
            )}

            <DialogFooter>
              <button
                type="button"
                onClick={() => setEditOpen(false)}
                disabled={updating}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={updating}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
              >
                {updating ? "Saving..." : "Save Changes"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Delete Collection</DialogTitle>

      <DialogDescription>
        Are you sure you want to delete &quot;{collection.name}&quot;?
        The bookmarks inside this collection will not be deleted.
      </DialogDescription>
    </DialogHeader>

    {deleteError && (
      <p className="text-sm text-destructive">
        {deleteError}
      </p>
    )}

    <DialogFooter>
      {/* Close the confirmation dialog without deleting anything. */}
      <button
        type="button"
        onClick={() => setDeleteOpen(false)}
        disabled={deleting}
        className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
      >
        Cancel
      </button>

      {/* Sends DELETE /api/collections/:id. */}
      <button
        type="button"
        onClick={handleDeleteCollection}
        disabled={deleting}
        className="rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:opacity-90 disabled:opacity-50"
      >
        {deleting ? "Deleting..." : "Delete"}
      </button>
    </DialogFooter>
  </DialogContent>
</Dialog>

      {collection.bookmarks.length > 0 ? (
        <div className="space-y-4">
          {/* Display each bookmark belonging to this collection. */}
          {collection.bookmarks.map(({ bookmark }) => (
            <div
              key={bookmark.id}
              className="bg-background border border-border rounded-lg p-4"
            >
              <h2 className="font-medium text-foreground">{bookmark.title}</h2>

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
