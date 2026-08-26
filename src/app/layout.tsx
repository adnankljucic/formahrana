import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import TabBar from "@/components/TabBar";
import CycleStrip from "@/components/CycleStrip";
import TimerProvider from "@/components/TimerProvider";
import SyncProvider, { SyncedContent } from "@/components/SyncProvider";

const text = IBM_Plex_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600"],
  variable: "--ff-text",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600"],
  variable: "--ff-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Plan ishrane",
  description: "30-dnevni plan ishrane i vodič kroz pripremu u fritezi.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Plan ishrane",
  },
  icons: {
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f4f4" },
    { media: "(prefers-color-scheme: dark)", color: "#161616" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bs">
      <body className={`${text.variable} ${mono.variable}`}>
        <SyncProvider>
          <TimerProvider>
            <SyncedContent>{children}</SyncedContent>
            <CycleStrip />
            <TabBar />
          </TimerProvider>
        </SyncProvider>
      </body>
    </html>
  );
}
