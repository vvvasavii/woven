import {ClerkProvider} from "@clerk/nextjs";
import { shadcn } from "@clerk/ui/themes";
import type { Metadata } from "next";
import { Elsie_Swash_Caps, Crimson_Text } from "next/font/google";import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";


const elsie = Elsie_Swash_Caps({
  variable: "--font-elsie",
  subsets: ["latin"],
  weight: "400",
});

const crimson = Crimson_Text({
  variable: "--font-crimson",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "Woven",
  description: "A thoughtfully crafted bookmark manager",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${elsie.variable} ${crimson.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <ClerkProvider 
          appearance={{
            theme: shadcn,
            variables: {
  colorForeground: "#3b2923",
  colorMutedForeground: "#6f625b",
  colorPrimary: "#a85f43",
  colorDanger: "#a84f42",
},
            elements: {
              rootBox: {
                color: "var(--foreground)",
              },
              
              card: {
                background: "var(--popover)",
                color: "var(--foreground)",
              },
              headerTitle: {
                color: "var(--foreground)",
                fontWeight: "600",
              },
              headerSubtitle: {
                color: "var(--muted-foreground)",
              },
              socialButtonsBlock: {
                color: "var(--foreground)",
              },
              socialButtonsBlockButton: {
                color: "var(--foreground)",
              },
              dividerText: {
                color: "var(--muted-foreground)",
              },
              formFieldLabel: {
                color: "var(--foreground)",
                fontWeight: "500",
              },
              formFieldInput: {
                background: "var(--background)",
                color: "var(--foreground)",
                borderColor: "var(--border)",
              },
              // Override form fields in dark contexts (like delete account modal)
              formFieldLabelDark: {
                color: "var(--primary-foreground)",
                fontWeight: "600",
              },
              formFieldInputDark: {
                background: "var(--sidebar-accent)",
                color: "var(--primary-foreground)",
                borderColor: "var(--sidebar-border)",
              },
              formFieldInputFocus: {
                borderColor: "var(--primary)",
                boxShadow: "0 0 0 2px var(--ring)",
              },
              formFieldWarningText: {
                color: "var(--destructive)",
              },
              footerActionLink: {
                color: "var(--primary)",
                fontWeight: "500",
              },
              footerActionText: {
                color: "var(--muted-foreground)",
              },
              formButtonPrimary: {
                background: "var(--primary)",
                color: "var(--primary-foreground)",
                fontWeight: "500",
              },
              formButtonPrimaryHover: {
                background: "var(--primary)",
                opacity: "0.9",
              },
              identityPreview: {
                color: "var(--foreground)",
              },
              identityPreviewText: {
                color: "var(--foreground)",
              },
              identityPreviewEditButton: {
                color: "var(--primary)",
              },
              navbar: {
                background: "var(--sidebar)",
                borderColor: "var(--sidebar-border)",
              },
              navbarRow: {
                color: "var(--primary-foreground)",
              },
              navbarRowAction: {
                color: "var(--primary-foreground)",
              },
              scrollBox: {
                borderColor: "var(--sidebar-border)",
              },
              accountPreview: {
                color: "var(--primary-foreground)",
              },
              accountPreviewAvatar: {
                background: "var(--primary)",
                color: "var(--primary-foreground)",
              },
              accountPreviewText: {
                color: "var(--primary-foreground)",
              },
              accountPreviewAction: {
                color: "var(--primary-foreground)",
              },
              userButtonPopoverCard: {
                background: "var(--sidebar)",
                color: "var(--primary-foreground)",
              },
              userButtonPopoverActionButton: {
                color: "var(--primary-foreground)",
              },
              userButtonPopoverActionButtonText: {
                color: "var(--primary-foreground)",
              },
              userButtonPopoverFooter: {
                color: "var(--primary-foreground)",
              },
              
              badge: {
  background: "#a85f43",
  color: "#ffffff",
  fontWeight: "600",
},

modalCloseButton: {
  color: "#3b2923",
},

modalCloseButtonIcon: {
  color: "#3b2923",
},
              // Account page elements
              profilePage: {
                color: "var(--primary-foreground)",
              },
              profileSection: {
                color: "var(--primary-foreground)",
              },
              profileSectionTitle: {
                color: "var(--primary-foreground)",
                fontWeight: "700",
              },
              profileSectionButton: {
                color: "var(--primary-foreground)",
                background: "var(--sidebar-accent)",
              },
              profileSectionButtonText: {
                color: "var(--primary-foreground)",
              },
              // Section headings (Security, Profile details)
              pageHeaderTitle: {
                color: "var(--primary-foreground)",
                fontWeight: "700",
                fontSize: "1.5rem",
              },
              pageHeaderSubtitle: {
                color: "var(--primary-foreground)",
              },
              // For "Update profile" and "Add email address" - remove orange-ish text
              navbarButton: {
                color: "var(--primary-foreground)",
              },
              navbarButtonText: {
                color: "var(--primary-foreground)",
              },
              // Button text in profile sections
              button: {
                color: "var(--primary-foreground)",
              },
              buttonText: {
                color: "var(--primary-foreground)",
              },
              // Link text (remove orange)
              link: {
                color: "var(--primary-foreground)",
              },
              linkText: {
                color: "var(--primary-foreground)",
              },
              // Three dots menu icons
              menuButton: {
                color: "var(--primary-foreground)",
              },
              menuButtonIcon: {
                color: "var(--primary-foreground)",
              },
              actionButton: {
                color: "var(--primary-foreground)",
              },
              actionButtonIcon: {
                color: "var(--primary-foreground)",
              },
              // Right-hand side options
              userButtonPopoverAction: {
                color: "var(--primary-foreground)",
              },
              userButtonPopoverActionText: {
                color: "var(--primary-foreground)",
              },
              // Delete account - white text, red background, dramatic hover effect
              userButtonPopoverActionDanger: {
                color: "var(--primary-foreground)",
                background: "var(--destructive)",
                border: "2px solid var(--destructive)",
                fontWeight: "700",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  background: "hsl(4 70% 36%)",
                  borderColor: "hsl(4 70% 26%)",
                  transform: "scale(1.02)",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                },
              },
              userButtonPopoverActionDangerText: {
                color: "var(--destructive)",
                fontWeight: "700",
              },
              // Delete account confirmation dialog - all text must be high contrast
              modalCard: {
                background: "var(--sidebar)",
                color: "var(--primary-foreground)",
              },
              modalTitle: {
                color: "var(--primary-foreground)",
                fontWeight: "700",
              },
              modalText: {
                color: "var(--primary-foreground)",
              },
              modalDescription: {
                color: "var(--primary-foreground)",
              },
              alertText: {
                color: "var(--primary-foreground)",
              },
              alertDescription: {
                color: "var(--primary-foreground)",
              },
              // Delete account confirmation dialog form fields
              modalFormFieldLabel: {
                color: "var(--primary-foreground)",
                fontWeight: "600",
              },
              modalFormFieldInput: {
                background: "var(--sidebar-accent)",
                color: "var(--primary-foreground)",
                borderColor: "var(--sidebar-border)",
              },
        
              // Additional targeting for delete account button
              actionButtonDanger: {
                color: "var(--primary-foreground)",
                background: "var(--destructive)",
                fontWeight: "700",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  background: "hsl(4 70% 36%)",
                  borderColor: "hsl(4 70% 26%)",
                  transform: "scale(1.02)",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                },
              },
              // Tabs
              tabs: {
                color: "var(--primary-foreground)",
              },
              tabsList: {
                background: "var(--sidebar-accent)",
                borderColor: "var(--sidebar-border)",
              },
              tabsTrigger: {
                color: "var(--primary-foreground)",
              },
              tabsTriggerActive: {
                color: "var(--primary-foreground)",
                background: "var(--primary)",
              },
            },
          }}
        >
          <AppShell>{children}</AppShell>
        </ClerkProvider>
      </body>
    </html>
  );
}