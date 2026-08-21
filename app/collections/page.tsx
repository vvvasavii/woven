"use client"; //"use client" is used because this page needs React state and useEffect
// to fetch and display data from the backend.

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { CollectionCard } from "@/components/dashboard/CollectionCard";
import { EmptyState } from "@/components/common/EmptyState";
import { FolderKanban, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { CollectionImageUpload } from "@/components/collections/CollectionImageUpload";

interface Collection {
  id: string;
  name: string;
  description: string | null;
  coverImage: string | null;
  _count: {
    bookmarks: number;
  };
}

export default function CollectionsPage() {
  const searchParams = useSearchParams();
const search = searchParams.get("q") ?? "";
  const [collections, setCollections] = useState<Collection[]>([]); //collections → data received from the API
  const [loading, setLoading] = useState(true); //whether the API request is still running
  const [error, setError] = useState(""); // message shown if the request fails
  // Controls whether the Create Collection dialog is open.
  const [open, setOpen] = useState(false);

  // Stores the collection name entered in the form.
  const [name, setName] = useState("");

  // Stores the optional collection description.
  const [description, setDescription] = useState("");

  // Stores the Cloudinary URL of the uploaded cover image.
  const [coverImage, setCoverImage] = useState<string | null>(null);

  // Tracks whether the collection is currently being created.
  const [creating, setCreating] = useState(false);

  // Stores an error specifically related to collection creation.
  const [createError, setCreateError] = useState("");

  useEffect(() => {
    // useEffect runs the API request when the page loads.

    async function fetchCollections() {
      try {
        // Fetch the authenticated user's collections from the backend.
        // Build the API URL with the search term when one exists.
        const query = search ? `?q=${encodeURIComponent(search)}` : "";

        const response = await fetch(`/api/collections${query}`);

        // Treat non-successful HTTP responses as errors.
        if (!response.ok) {
          throw new Error("Failed to fetch collections");
        }
        // Convert the JSON response into JavaScript data.
        const data = await response.json();

        // Store the fetched collections so React can display them.
        setCollections(data);
      } catch (error) {
        console.error("Error fetching collections:", error);
        setError("Failed to load collections");
      } finally {
        // Stop showing the loading state after the request finishes.
        setLoading(false);
      }
    }
    // Fetch collections when the page first loads.
    fetchCollections(); //useEffect runs the fetchCollections function when the Collections page mounts, so we can fetch the user's collections from the backend.
  }, [search]);

  async function handleCreateCollection(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setCreating(true);
    setCreateError("");

    try {
      const response = await fetch("/api/collections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description: description || undefined,
          coverImage: coverImage || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create collection");
      }

      // Add the newly created collection to the existing list.
      // The API response does not contain _count, so start it at zero.
      const newCollection: Collection = {
        ...data,
        _count: {
          bookmarks: 0,
        },
      };

      setCollections((currentCollections) => [
        //Take whatever collections are currently stored, put the new collection at the beginning, and make that the new state.
        newCollection, //newCollection → the collection we just created, so we can add it to the front of the list.
        ...currentCollections, //..currentCollections → the existing collections in state, so we can add the new collection to the front of the list.
      ]);

      // Reset the form after successful creation.
      setName("");
      setDescription("");
      setCoverImage(null);

      // Close the dialog.
      setOpen(false);
    } catch (error) {
      console.error("Error creating collection:", error);
      setCreateError(
        error instanceof Error ? error.message : "Failed to create collection",
      );
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <SectionHeader
        title="Collections"
        subtitle="Organize your bookmarks by topic"
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <span className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Collection
              </span>
            </button>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Collection</DialogTitle>
                <DialogDescription>
                  Create a collection to organize your bookmarks.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleCreateCollection} className="space-y-5">
                <div className="space-y-2">
                  <label
                    htmlFor="collection-name"
                    className="text-sm font-medium"
                  >
                    Name
                  </label>

                  <input
                    id="collection-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="e.g. Frontend"
                    maxLength={100}
                    required
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="collection-description"
                    className="text-sm font-medium"
                  >
                    Description
                  </label>

                  <textarea
                    id="collection-description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="What is this collection for?"
                    maxLength={500}
                    rows={3}
                    className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Cover Image</label>

                  <CollectionImageUpload
                    value={coverImage}
                    onChange={setCoverImage}
                  />
                </div>

                {createError && (
                  <p className="text-sm text-destructive">{createError}</p>
                )}

                <DialogFooter>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    disabled={creating}
                    className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={creating}
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
                  >
                    {creating ? "Creating..." : "Create"}
                  </button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Collections Grid ---  Show loading, error, collection list, or empty state depending on the current state. */}
      {loading ? (
        <p className="text-muted-foreground">Loading collections...</p>
      ) : error ? (
        <p className="text-destructive">{error}</p>
      ) : collections.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map((collection) => (
            <CollectionCard
              key={collection.id}
              id={collection.id}
              name={collection.name}
              count={collection._count.bookmarks} // _count.bookmarks comes from Prisma and tells us how many bookmarks belong to this collection.
              description={collection.description ?? undefined}
              coverImage={collection.coverImage}
            />
          ))}
        </div>
      ) : (
        <EmptyState //Displayed when the user has no collections.
          icon={<FolderKanban className="h-12 w-12" />}
          title="No collections yet"
          description="Create your first collection to start organizing your bookmarks"
          action={
            <button
  type="button"
  onClick={() => setOpen(true)}
  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
>
  Create Collection
</button>
          }
        />
      )}
    </div>
  );
}

// app/collections/page.tsx is a Client Component because it needs React state, effects, and user interactions such as opening the Create Collection dialog and submitting the form.

// We define a Collection TypeScript interface to describe the shape of collection data returned by our API.

// The component maintains state for the collections, loading state, and errors.

// When the component mounts, useEffect runs fetchCollections, which calls GET /api/collections. The response is converted from JSON using response.json(), and setCollections stores that data in React state. Updating the state causes the component to re-render and display the real collections.

// The Create Collection handler runs when the user submits the form. event.preventDefault() prevents the browser's normal form submission. We then send a POST request to /api/collections containing the form data.

// After the API successfully creates the collection, we receive the new collection from the server. We use setCollections with the previous collection state to add the new collection to the beginning of the existing array, so the new collection appears immediately without refreshing or fetching all collections again.

// useState
// → stores data that can change

// useEffect
// → runs the fetch when the page loads

// fetch()
// → calls our backend API

// response.json()
// → converts the API response into usable data

// setCollections()
// → stores the API data in React state, updates React state

// setCollections(prev => [newItem, ...prev])
// → keep old items + add the new item

// loading
// → controls the loading UI

// error
// → controls the error UI

// collections.map()
// → creates one CollectionCard for each collection

// collection._count.bookmarks
// → gives the number of bookmarks in that collection
