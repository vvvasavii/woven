import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { User, Palette, Bell, Shield } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <SectionHeader
        title="Settings"
        subtitle="Manage your account and preferences"
      />

      {/* Settings - Single Block */}
      <div className="bg-[var(--card-secondary)] border border-border rounded-xl p-6 space-y-8">
        {/* Profile Section */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <User className="h-5 w-5 text-card-foreground/70" />
            <h3 className="text-lg font-medium text-card-foreground">Profile</h3>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Name
                </label>
                <input
                  type="text"
                  placeholder="Your name"
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-card-foreground placeholder:text-card-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring"
                  // TODO: Implement profile update functionality
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-card-foreground placeholder:text-card-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring"
                  // TODO: Implement profile update functionality
                />
              </div>
            </div>
          </div>
        </div>

        {/* Appearance Section */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Palette className="h-5 w-5 text-card-foreground/70" />
            <h3 className="text-lg font-medium text-card-foreground">Appearance</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-card-foreground">Theme</p>
                <p className="text-sm text-card-foreground/70">
                  Choose your preferred color scheme
                </p>
              </div>
              <button
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                // TODO: Implement theme toggle functionality
              >
                Light
              </button>
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Bell className="h-5 w-5 text-card-foreground/70" />
            <h3 className="text-lg font-medium text-card-foreground">Notifications</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-card-foreground">Email notifications</p>
                <p className="text-sm text-card-foreground/70">
                  Receive updates about your bookmarks
                </p>
              </div>
              <button
                className="w-12 h-6 bg-primary rounded-full relative transition-colors"
                // TODO: Implement notification toggle functionality
              >
                <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
              </button>
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-5 w-5 text-card-foreground/70" />
            <h3 className="text-lg font-medium text-card-foreground">Security</h3>
          </div>
          <div className="space-y-4">
            <button
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
              // TODO: Implement password change functionality
            >
              Change Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}