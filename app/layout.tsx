import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import clsx from "clsx";

import { Providers } from "./providers";
import { NewVersionToast } from "@/components/NewVersionToast";

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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener("error", function(e) {
                if (e.message && e.message.includes("Failed to load chunk")) {
                  e.preventDefault();
                  var toast = document.createElement("div");
                  toast.id = "chunk-error-toast";
                  toast.style.cssText = "position:fixed;bottom:4rem;right:1rem;z-index:9999;display:flex;align-items:center;gap:0.75rem;padding:0.75rem 1rem;border-radius:0.75rem;background:#f31260;color:white;box-shadow:0 4px 20px rgba(0,0,0,0.2);";
                  toast.innerHTML = '<span style="font-size:0.875rem;font-weight:500">Atualização disponível — clique para recarregar</span><button style="background:rgba(255,255,255,0.2);color:white;border:none;border-radius:0.5rem;padding:0.375rem 0.75rem;font-size:0.75rem;font-weight:600;cursor:pointer" onclick="window.location.reload()">Recarregar</button>';
                  document.body.appendChild(toast);
                }
              });
            `,
          }}
        />
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
          <NewVersionToast />
        </Providers>
      </body>
    </html>
  );
}
