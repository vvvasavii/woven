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
      className="group block bg-background/20 shadow-amber-950 border border-border rounded-lg p-3 sm:p-4 hover:-translate-y-0.5 hover:shadow-md hover:bg-card/60 transition-all duration-200"
    >
      <div className="flex items-start gap-3 mb-2">
        {coverImage ? (
          <img
            src={coverImage}
            alt={`${name} cover`}
            className="h-12 w-12 sm:h-16 sm:w-16 rounded-md object-cover flex-shrink-0"
          />
        ) : (
          <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-md bg-[var(--chip-background)] flex-shrink-0">
            <FolderKanban className="h-full w-full p-3 sm:p-4 text-foreground/70" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-medium text-foreground truncate">{name}</h3>
            <ChevronRight className="h-4 w-4 text-foreground/40 group-hover:text-foreground/70 transition-colors flex-shrink-0 ml-2" />
          </div>
        </div>
      </div>

      <div className="ml-[3.75rem] sm:ml-0 sm:pl-8">
        {/* Displays the number of bookmarks in this collection. */}
        <p className="text-xs sm:text-sm text-muted-foreground mb-1">{count} bookmarks</p>

        {/* Only displays the description if one exists. */}
        {description && (
          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">
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
