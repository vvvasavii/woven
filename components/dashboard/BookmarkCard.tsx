import { Heart } from "lucide-react";

interface BookmarkCardProps {
  title: string;
  domain: string;
  collection: string;
  isFavorite?: boolean;
}

export function BookmarkCard({ title, domain, collection, isFavorite = false }: BookmarkCardProps) {
  return (
    <div className="bg-[var(--card-secondary)] border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-base font-medium text-card-foreground line-clamp-1">{title}</h3>
        {isFavorite && (
          <Heart className="h-5 w-5 text-[var(--favorite-highlight)] fill-[var(--favorite-highlight)] flex-shrink-0 ml-2" />
        )}
      </div>
      <p className="text-sm text-card-foreground/70 mb-2">{domain}</p>
      <div className="inline-flex items-center px-2 py-1 rounded-md bg-[var(--chip-background)] text-xs text-[var(--chip-foreground)]">
        {collection}
      </div>
    </div>
  );
}
