import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { BookmarkCard } from "@/components/dashboard/BookmarkCard";
import { EmptyState } from "@/components/common/EmptyState";
import { Heart } from "lucide-react";

// TODO: Replace with actual data from backend
const placeholderFavorites = [
  {
    id: "1",
    title: "Understanding React Server Components",
    domain: "react.dev",
    collection: "React",
    isFavorite: true,
  },
  {
    id: "2",
    title: "TypeScript Best Practices",
    domain: "typescriptlang.org",
    collection: "React",
    isFavorite: true,
  },
  {
    id: "3",
    title: "Tailwind CSS Guide",
    domain: "tailwindcss.com",
    collection: "Design",
    isFavorite: true,
  },
];

export default function FavoritesPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <SectionHeader
        title="Favorites"
        subtitle="Quick access to your most important bookmarks"
      />

      {/* Favorites Grid */}
      {placeholderFavorites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {placeholderFavorites.map((bookmark) => (
            <BookmarkCard
              key={bookmark.id}
              title={bookmark.title}
              domain={bookmark.domain}
              collection={bookmark.collection}
              isFavorite={bookmark.isFavorite}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Heart className="h-12 w-12" />}
          title="No favorites yet"
          description="Mark bookmarks as favorites to access them quickly"
        />
      )}
    </div>
  );
}