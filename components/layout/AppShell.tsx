import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <div className="lg:ml-64">
        <TopNav />

        {/* Fixed background keeps the image scale consistent across pages */}
        <div
          className="fixed inset-x-0 top-16 bottom-0 bg-cover bg-center bg-no-repeat lg:left-64"
          style={{ backgroundImage: "url('woven-bg7.png')" }}
        />

        {/* Page content sits above the shared background */}
        <main className="relative min-h-[calc(100vh-4rem)] p-3 sm:p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}