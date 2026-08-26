import type { Metadata, Viewport } from "next";
import { Archivo, Source_Sans_3, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import TabBar from "@/components/TabBar";
import TimerProvider from "@/components/TimerProvider";

const archivo = Archivo({
  subsets: ["latin", "latin-ext"],
  weight: ["600", "700", "800"],
  variable: "--font-archivo",
  display: "swap",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600", "700"],
  variable: "--font-source",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  variable: "--font-mono-ibm",
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
    { media: "(prefers-color-scheme: light)", color: "#f6f5f1" },
    { media: "(prefers-color-scheme: dark)", color: "#14160f" },
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
        className={`${archivo.variable} ${sourceSans.variable} ${plexMono.variable}`}
      >
        <TimerProvider>
          <div
            style={{
              paddingBottom: "calc(56px + env(safe-area-inset-bottom) + 8px)",
            }}
          >
            {children}
          </div>
          <TabBar />
        </TimerProvider>
      </body>
    </html>
  );
}
