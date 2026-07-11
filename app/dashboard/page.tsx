import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { BookmarkCard } from "@/components/dashboard/BookmarkCard";
import { CollectionCard } from "@/components/dashboard/CollectionCard";

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
];

// TODO: Replace with actual data from backend
const placeholderCollections = [
  {
    id: "1",
    name: "DSA",
    count: 24,
    description: "Data structures and algorithms resources",
  },
  {
    id: "2",
    name: "React",
    count: 18,
    description: "React ecosystem and best practices",
  },
  {
    id: "3",
    name: "Design Inspiration",
    count: 12,
    description: "UI/UX patterns and design systems",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <DashboardHeader
        greeting="Good afternoon"
        title="Welcome back to Woven."
        subtitle="Your personal knowledge library is ready."
      />

      {/* Statistics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          label="Total Bookmarks"
          value="54"
          description="Across all collections"
        />
        <StatCard
          label="Collections"
          value="8"
          description="Organized by topic"
        />
        <StatCard
          label="Favorites"
          value="12"
          description="Quick access items"
        />
      </div>

      {/* Recent Bookmarks */}
      <section>
        <SectionHeader
          title="Recent Bookmarks"
          subtitle="Your latest additions"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
      </section>

      {/* Collections Preview */}
      <section>
        <SectionHeader
          title="Collections"
          subtitle="Browse your organized knowledge"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {placeholderCollections.map((collection) => (
            <CollectionCard
              key={collection.id}
              name={collection.name}
              count={collection.count}
              description={collection.description}
            />
          ))}
        </div>
      </section>
    </div>
  );
}