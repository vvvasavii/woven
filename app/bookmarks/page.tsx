import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { BookmarkCard } from "@/components/dashboard/BookmarkCard";
import { EmptyState } from "@/components/common/EmptyState";
import { Bookmark, Plus } from "lucide-react";

// TODO: Replace with actual data from backend
const placeholderBookmarks = [
  {
    id: "1",
    title: "Understanding React Server Components",
    domain: "react.dev",
    collection: "React",
    isFavorite: true,
  },
  {
    id: "2",
    title: "Modern CSS Techniques",
    domain: "css-tricks.com",
    collection: "Design",
    isFavorite: false,
  },
  {
    id: "3",
    title: "TypeScript Best Practices",
    domain: "typescriptlang.org",
    collection: "React",
    isFavorite: true,
  },
  {
    id: "4",
    title: "Building Accessible UI Components",
    domain: "web.dev",
    collection: "Design",
    isFavorite: false,
  },
  {
    id: "5",
    title: "Next.js Documentation",
    domain: "nextjs.org",
    collection: "React",
    isFavorite: false,
  },
  {
    id: "6",
    title: "Tailwind CSS Guide",
    domain: "tailwindcss.com",
    collection: "Design",
    isFavorite: true,
  },
];

export default function BookmarksPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <SectionHeader
        title="Bookmarks"
        subtitle="All your saved resources in one place"
        action={
          <button
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            // TODO: Implement add bookmark functionality
          >
            <span className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Bookmark
            </span>
          </button>
        }
      />

      {/* Bookmarks Grid */}
      {placeholderBookmarks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {placeholderBookmarks.map((bookmark) => (
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
          icon={<Bookmark className="h-12 w-12" />}
          title="No bookmarks yet"
          description="Save your first bookmark to start building your knowledge library"
          action={
            <button
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
              // TODO: Implement add bookmark functionality
            >
              Add Bookmark
            </button>
          }
        />
      )}
    </div>
  );
}