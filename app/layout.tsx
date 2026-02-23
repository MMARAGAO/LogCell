import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import clsx from "clsx";

import { Providers } from "./providers";

import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: siteConfig.name,
  },
  manifest: "/manifest.json",
  other: {
    // Otimizar carregamento de recursos
    "resource-hints": "preconnect",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <head>
        <link href="/apple-touch-icon.png" rel="apple-touch-icon" />
        <link
          href="/icon-192.png"
          rel="icon"
          sizes="192x192"
          type="image/png"
        />
        <link
          href="/icon-512.png"
          rel="icon"
          sizes="512x512"
          type="image/png"
        />
        <meta content="yes" name="apple-mobile-web-app-capable" />
        <meta content="default" name="apple-mobile-web-app-status-bar-style" />
        <meta content="LogCell" name="apple-mobile-web-app-title" />
      </head>
      <body
        suppressHydrationWarning
        className={clsx(
          "min-h-screen text-foreground bg-background font-sans antialiased",
          fontSans.variable,
        )}
      >
        <Providers
          themeProps={{
            attribute: "class",
            defaultTheme: "light",
            enableSystem: false,
            storageKey: "logcell-theme",
            enableColorScheme: true,
          }}
        >
          <div className="relative flex flex-col h-screen">
            <main className="">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
