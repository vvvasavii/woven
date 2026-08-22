"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  FolderKanban, 
  Bookmark, 
  Heart 
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Collections", href: "/collections", icon: FolderKanban },
  { name: "Bookmarks", href: "/bookmarks", icon: Bookmark },
  { name: "Favorites", href: "/favorites", icon: Heart },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside 
      className="fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar border-r border-sidebar-border flex flex-col"
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-sidebar-border">
        <span className="text-xl font-semibold text-sidebar-foreground">Woven</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Primary navigation">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                focus:outline-none focus:ring-2 focus:ring-sidebar-ring focus:ring-offset-2 focus:ring-offset-sidebar
                ${isActive 
                  ? "bg-sidebar-primary text-sidebar-primary-foreground" 
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }
              `}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="text-xs text-sidebar-foreground/70">
          {/* TODO: Add user info or version info when backend is integrated */}
        </div>
      </div>
    </aside>
  );
}
