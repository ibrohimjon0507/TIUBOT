import type { Metadata, Viewport } from "next";
import { PwaRegister } from "@/components/pwa";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "TIU Admin — Telegram bot boshqaruvi",
    template: "%s · TIU Admin",
  },
  description:
    "Toshkent Xalqaro Universiteti Telegram boti uchun boshqaruv paneli: talabalar, savol-javoblar, xalqaro dasturlar va fakultet mas'ullari.",
  manifest: "/manifest.webmanifest",
  applicationName: "TIU Admin",
  appleWebApp: {
    capable: true,
    title: "TIU Admin",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  // Admin paneli qidiruv tizimlariga tushmasligi kerak
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#1b2a4a",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <PwaRegister />
      </body>
    </html>
  );
}
