import type { Metadata } from "next";
import localFont from "next/font/local";
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider"

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Mini-Valhalla",
  description: "Une mini-carte utilisant Valhalla, Leaflet et Nominatim d'OpenStreetMap"};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
       <head>
       <meta name="viewport" content="width=device-width, initial-scale=1"/>
       <link rel='icon' href='/images/minimap.png' type="image/png" />
        </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange>
        <TooltipProvider>
          <div className="relative h-screen w-screen">
            {/* Sidebar as an overlay on top of the map */}
            <div className="relative z-10 w-full h-full">{children}
              <Analytics />
            <SpeedInsights /></div>
          </div>
        </TooltipProvider></ThemeProvider>
      </body>
    </html>
  );
}
