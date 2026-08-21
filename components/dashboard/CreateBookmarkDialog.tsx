"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ExternalLink, Loader2 } from "lucide-react";

interface Collection {
  id: string;
  name: string;
}

interface CreateBookmarkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBookmarkCreated: () => void;
}

export function CreateBookmarkDialog({
  open,
  onOpenChange,
  onBookmarkCreated,
}: CreateBookmarkDialogProps) {
  const [url, setUrl] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [domain, setDomain] = useState("");
  const [favicon, setFavicon] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [notes, setNotes] = useState("");
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<
    string[]
  >([]);

  const [fetchingPreview, setFetchingPreview] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  // Fetch the user's collections when the dialog opens.
  useEffect(() => {
    if (!open) {
      return;
    }

    async function fetchCollections() {
      try {
        const response = await fetch("/api/collections");

        if (!response.ok) {
          throw new Error("Failed to fetch collections");
        }

        const data = await response.json();
        setCollections(data);
      } catch (error) {
        console.error("Error fetching collections:", error);
        setError("Failed to load collections");
      }
    }

    fetchCollections();
  }, [open]);

  // Fetch metadata for the entered URL.
  async function handleFetchPreview() {
    if (!url.trim()) {
      setError("Please enter a URL");
      return;
    }

    setFetchingPreview(true);
    setError("");

    try {
      const response = await fetch("/api/link-preview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: url.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch link preview");
      }

      // Populate the editable fields with the fetched metadata.
      setTitle(data.title ?? "");
      setDescription(data.description ?? "");
      setDomain(data.domain ?? "");
      setFavicon(data.favicon ?? null);
      setPreviewImage(data.previewImage ?? null);
    } catch (error) {
      console.error("Error fetching link preview:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to fetch link preview",
      );
    } finally {
      setFetchingPreview(false);
    }
  }

  // Toggle a collection in the selected collection list.
  function toggleCollection(collectionId: string) {
    setSelectedCollectionIds((currentIds) => {
      if (currentIds.includes(collectionId)) {
        return currentIds.filter((id) => id !== collectionId);
      }

      return [...currentIds, collectionId];
    });
  }

  // Create the bookmark using the reviewed metadata.
  async function handleSave() {
    if (!url.trim()) {
      setError("Please enter a URL");
      return;
    }

    if (!title.trim()) {
      setError("Please fetch the link preview or enter a title");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/bookmarks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: url.trim(),
          title: title.trim(),
          description: description.trim() || undefined,
          domain: domain.trim() || undefined,
          favicon: favicon || undefined,
          previewImage: previewImage || undefined,
          notes: notes.trim() || undefined,
          collectionIds: selectedCollectionIds,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create bookmark");
      }

      // Tell the bookmarks page to refresh its data.
      onBookmarkCreated();

      // Close the dialog after successful creation.
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating bookmark:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to create bookmark",
      );
    } finally {
      setSaving(false);
    }
  }

  function handleClose() {
    if (saving || fetchingPreview) {
      return;
    }

    // Clear the form when the dialog closes.
    setUrl("");
    setTitle("");
    setDescription("");
    setDomain("");
    setFavicon(null);
    setPreviewImage(null);
    setNotes("");
    setSelectedCollectionIds([]);
    setError("");

    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Bookmark</DialogTitle>
          <DialogDescription>
            Paste a URL and review its details before saving it.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* URL + Fetch button */}
          <div>
            <label className="text-sm font-medium">URL</label>

            <div className="flex gap-2 mt-1">
              <input
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://example.com"
                className="flex-1 min-w-0 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />

              <button
                type="button"
                onClick={handleFetchPreview}
                disabled={fetchingPreview}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
              >
                {fetchingPreview && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}

                {fetchingPreview ? "Fetching..." : "Fetch"}
              </button>
            </div>
          </div>

          {/* Preview */}
          {(title || description || previewImage) && (
            <div className="rounded-lg border border-border overflow-hidden">
              {previewImage && (
                <img
                  src={previewImage}
                  alt=""
                  className="w-full max-h-48 object-cover"
                />
              )}

              <div className="p-4 space-y-1">
                <p className="font-medium">{title}</p>

                {domain && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>{domain}</span>
                  </div>
                )}

                {description && (
                  <p className="text-sm text-muted-foreground">
                    {description}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Editable title */}
          <div>
            <label className="text-sm font-medium">Title</label>

            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Bookmark title"
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Editable description */}
          <div>
            <label className="text-sm font-medium">Description</label>

            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Description"
              rows={3}
              className="mt-1 w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Collections */}
          <div>
            <label className="text-sm font-medium">Collections</label>

            {collections.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {collections.map((collection) => {
                  const selected = selectedCollectionIds.includes(
                    collection.id,
                  );

                  return (
                    <button
                      key={collection.id}
                      type="button"
                      onClick={() => toggleCollection(collection.id)}
                      className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                        selected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:bg-muted"
                      }`}
                    >
                      {collection.name}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                No collections yet. You can save this bookmark without one.
              </p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm font-medium">My Notes</label>

            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Add your own notes..."
              rows={4}
              className="mt-1 w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <button
            type="button"
            onClick={handleClose}
            disabled={saving}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Bookmark"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}