import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import TabBar from "@/components/TabBar";
import TimerProvider from "@/components/TimerProvider";
import SyncProvider, { SyncedContent } from "@/components/SyncProvider";

const display = Space_Grotesk({
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700"],
  variable: "--ff-display",
  display: "swap",
});

const text = Inter({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--ff-text",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
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
    { media: "(prefers-color-scheme: light)", color: "#f2f2f3" },
    { media: "(prefers-color-scheme: dark)", color: "#0d0e11" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bs">
      <body
        className={`${display.variable} ${text.variable} ${mono.variable}`}
      >
        <SyncProvider>
          <TimerProvider>
            <SyncedContent>{children}</SyncedContent>
            <TabBar />
          </TimerProvider>
        </SyncProvider>
      </body>
    </html>
  );
}
