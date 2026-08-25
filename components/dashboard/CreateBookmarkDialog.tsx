"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BookmarkPlus, Check, ExternalLink, Loader2, X } from "lucide-react";

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
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<string[]>(
    [],
  );

  const [fetchingPreview, setFetchingPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Fetch the user's collections when the dialog opens.
  useEffect(() => {
    if (!open) {
      return;
    }

    // Start with a fresh form every time the dialog opens.
    resetForm();

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
      console.log("Preview data received by frontend:", data);

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch link preview");
      }

      // Populate editable fields with the fetched metadata.
      setTitle(data.title ?? "");
      setDescription(data.description ?? "");
      setDomain(data.domain ?? "");
      setFavicon(data.favicon ?? null);
      setPreviewImage(data.previewImage ?? null);
    } catch (error) {
      console.error("Error fetching link preview:", error);

      setError(
        error instanceof Error ? error.message : "Failed to fetch link preview",
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

  // Reset all bookmark form fields to their initial values.
  function resetForm() {
    setUrl("");
    setTitle("");
    setDescription("");
    setDomain("");
    setFavicon(null);
    setPreviewImage(null);
    setNotes("");
    setSelectedCollectionIds([]);
    setError("");
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

      // Tell the parent page to refresh its bookmark data.
      onBookmarkCreated();

      // Reset the form after successful creation.
      resetForm();

      // Close the dialog after successful creation.
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating bookmark:", error);

      setError(
        error instanceof Error ? error.message : "Failed to create bookmark",
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
    resetForm();

    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        showCloseButton={false}
        className="
          w-[calc(100%-2rem)]
          max-w-[680px]
          max-h-[90vh]
          overflow-y-auto
          [scrollbar-width:none]
          [&::-webkit-scrollbar]:hidden
          bg-popover
          border-border/60
          shadow-xl
          p-5
          sm:p-6
        "
      >
        {/* Header matches Create/Edit Collection dialogs. */}
        <DialogHeader className="space-y-3 pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-2">
              <div className="flex items-center gap-3">
                <div className="shrink-0 rounded-lg bg-primary/10 p-2">
                  <BookmarkPlus className="h-5 w-5 text-primary" />
                </div>

                <DialogTitle className="text-xl font-semibold text-foreground">
                  Add Bookmark
                </DialogTitle>
              </div>

              <DialogDescription className="pl-12 text-sm text-muted-foreground">
                Paste a URL and review its details before saving it.
              </DialogDescription>
            </div>

            <button
              type="button"
              onClick={handleClose}
              disabled={saving || fetchingPreview}
              aria-label="Close bookmark creation"
              className="
                shrink-0 rounded-lg p-2
                text-muted-foreground
                transition-colors
                hover:bg-card/50
                hover:text-foreground
                disabled:cursor-not-allowed
                disabled:opacity-50
                focus:outline-none
                focus:ring-2
                focus:ring-primary/20
              "
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Same subtle accent line used by collection dialogs. */}
          <div className="h-px w-full bg-gradient-to-r from-primary/30 via-border/40 to-transparent" />
        </DialogHeader>

        <div className="space-y-6">
          {/* URL */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/90">
              URL
            </label>

            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://example.com"
                className="
                  min-w-0 flex-1
                  rounded-lg
                  border-2 border-border/60
                  bg-card/40
                  px-4 py-2.5
                  text-sm text-foreground
                  placeholder:text-muted-foreground/60
                  outline-none
                  transition-all
                  focus:border-primary/50
                  focus:ring-2 focus:ring-primary/10
                "
              />

              <button
                type="button"
                onClick={handleFetchPreview}
                disabled={fetchingPreview}
                className="
                  inline-flex shrink-0
                  items-center justify-center gap-2
                  rounded-lg
                  bg-primary
                  px-5 py-2.5
                  text-sm font-medium
                  text-primary-foreground
                  transition-colors
                  hover:bg-primary/90
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                  focus:outline-none
                  focus:ring-2 focus:ring-primary/50
                  focus:ring-offset-2
                  focus:ring-offset-popover
                "
              >
                {fetchingPreview && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}

                {fetchingPreview ? "Fetching..." : "Fetch"}
              </button>
            </div>
          </div>

          {/* Metadata preview */}
          {(title || description || previewImage) && (
            <div className="overflow-hidden rounded-lg border-2 border-border/60 bg-card/40">
              {previewImage && (
                <div className="border-b border-border/60">
                  <img
                    src={previewImage}
                    alt=""
                    className="max-h-56 w-full object-cover"
                  />
                </div>
              )}

              <div className="space-y-2 p-4">
                <p className="break-words font-medium text-foreground">
                  {title}
                </p>

                {domain && (
                  <div className="flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground">
                    <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{domain}</span>
                  </div>
                )}

                {description && (
                  <p className="break-words text-sm leading-relaxed text-muted-foreground">
                    {description}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/90">
              Title
            </label>

            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Bookmark title"
              className="
                w-full rounded-lg
                border-2 border-border/60
                bg-card/40
                px-4 py-2.5
                text-sm text-foreground
                placeholder:text-muted-foreground/60
                outline-none
                transition-all
                focus:border-primary/50
                focus:ring-2 focus:ring-primary/10
              "
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/90">
              Description
            </label>

            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Description"
              rows={3}
              className="
                w-full resize-none rounded-lg
                border-2 border-border/60
                bg-card/40
                px-4 py-2.5
                text-sm text-foreground
                placeholder:text-muted-foreground/60
                outline-none
                transition-all
                focus:border-primary/50
                focus:ring-2 focus:ring-primary/10
              "
            />
          </div>

          {/* Collections */}
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-foreground/90">
                Collections
              </label>

              <p className="mt-1 text-xs text-muted-foreground">
                Add this bookmark to one or more collections.
              </p>
            </div>

            {collections.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {collections.map((collection) => {
                  const selected = selectedCollectionIds.includes(
                    collection.id,
                  );

                  return (
                    <button
                      key={collection.id}
                      type="button"
                      onClick={() => toggleCollection(collection.id)}
                      aria-pressed={selected}
                      className={`
                        inline-flex max-w-full items-center gap-1.5
                        rounded-full
                        border
                        px-3 py-1.5
                        text-sm
                        transition-colors
                        ${
                          selected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border/60 bg-card/40 text-foreground hover:bg-card/60"
                        }
                      `}
                    >
                      {selected && <Check className="h-3.5 w-3.5 shrink-0" />}
                      <span className="truncate">{collection.name}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-lg border border-border/60 bg-card/40 px-4 py-3">
                <p className="text-sm text-muted-foreground">
                  No collections yet. You can save this bookmark without one.
                </p>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/90">
              My Notes
            </label>

            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Add your own notes..."
              rows={4}
              className="
                w-full resize-none rounded-lg
                border-2 border-border/60
                bg-card/40
                px-4 py-2.5
                text-sm text-foreground
                placeholder:text-muted-foreground/60
                outline-none
                transition-all
                focus:border-primary/50
                focus:ring-2 focus:ring-primary/10
              "
            />
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
        </div>

        {/* Actions match Create/Edit Collection dialogs. */}
        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={handleClose}
            disabled={saving}
            className="
              w-full rounded-lg
              border-2 border-border/60
              px-5 py-2.5
              text-sm font-medium
              text-foreground
              transition-colors
              hover:bg-card/50
              disabled:cursor-not-allowed
              disabled:opacity-50
              focus:outline-none
              focus:ring-2 focus:ring-primary/20
              focus:ring-offset-2
              focus:ring-offset-popover
              sm:w-auto
            "
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="
              w-full rounded-lg
              bg-primary
              px-5 py-2.5
              text-sm font-medium
              text-primary-foreground
              transition-colors
              hover:bg-primary/90
              disabled:cursor-not-allowed
              disabled:opacity-50
              focus:outline-none
              focus:ring-2 focus:ring-primary/50
              focus:ring-offset-2
              focus:ring-offset-popover
              sm:w-auto
            "
          >
            {saving ? "Saving..." : "Save Bookmark"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
