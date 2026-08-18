import Link from "next/link";
import { FolderKanban, ChevronRight } from "lucide-react";

// Defines the props that CollectionCard expects from the parent component.
// The parent must provide the collection id, name, and bookmark count.
// Description is optional.
interface CollectionCardProps {
  id: string;
  name: string;
  count: number;
  description?: string;
  coverImage?: string | null;
}

// CollectionCard receives collection data from CollectionsPage through props.
export function CollectionCard({
  id,
  name,
  count,
  description,
  coverImage,
}: CollectionCardProps) {
  return (
    // Makes the entire collection card clickable.
    // Clicking it navigates to the page for that specific collection.
    <Link
      href={`/collections/${id}`}
      className="group block bg-background border border-border rounded-lg p-4 hover:-translate-y-0.5 hover:shadow-md hover:bg-card/50 transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-3">
          {coverImage ? (
            <img
              src={coverImage}
              alt={`${name} cover`}
              className="h-16 w-16 rounded-md object-cover"
            />
          ) : (
            <div className="h-16 w-16 rounded-md bg-[var(--chip-background)]">
              <FolderKanban className="h-full w-full p-4 text-foreground/70" />
            </div>
          )}

          <h3 className="text-base font-medium text-foreground">{name}</h3>
        </div>

        <ChevronRight className="h-4 w-4 text-foreground/40 group-hover:text-foreground/70 transition-colors" />
      </div>

      <div className="pl-8">
        {/* Displays the number of bookmarks in this collection. */}
        <p className="text-sm text-muted-foreground mb-1">{count} bookmarks</p>

        {/* Only displays the description if one exists. */}
        {description && (
          <p className="text-sm text-muted-foreground line-clamp-1">
            {description}
          </p>
        )}
      </div>
    </Link>
  );
}

// CollectionsPage
//       ↓
// imports CollectionCard
//       ↓
// passes props
//       ↓
// CollectionCardProps checks those props
//       ↓
// CollectionCard displays them
//       ↓
// <Link> uses id to navigate to /collections/[id]
