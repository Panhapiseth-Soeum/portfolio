import type { Metadata } from "next";
import { Inter, Space_Grotesk, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { sanityFetch } from "@/sanity/fetch";
import { siteSettingsQuery } from "@/sanity/queries";
import { urlForImage } from "@/sanity/image";
import type { SiteSettings } from "@/types/sanity";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/ui/ScrollToTop";
import { LazyBackgroundParticles } from "@/components/three/LazyScene";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

function getSiteSettings(): Promise<SiteSettings | null> {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  if (!projectId || projectId === "placeholder") return Promise.resolve(null);
  return sanityFetch<SiteSettings | null>({
    query: siteSettingsQuery,
    tags: ["siteSettings"],
  }).catch(() => null);
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: settings?.title || "Portfolio",
    description: settings?.description || "Developer Portfolio",
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();

  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${geistMono.variable} antialiased`}
      suppressHydrationWarning
    >
      <head>
        {settings?.favicon && (
          <link
            rel="icon"
            href={urlForImage(settings.favicon).width(32).height(32).url()}
          />
        )}
      </head>
      <body className="min-h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <ThemeProvider>
          <LazyBackgroundParticles />
          <Navigation
            siteTitle={settings?.title || "Portfolio"}
            navItems={settings?.navItems}
          />
          <main className="relative z-10 flex-1">{children}</main>
          <Footer
            siteTitle={settings?.title || "Portfolio"}
            socialLinks={settings?.socialLinks}
          />
          <ScrollToTop />
          <Analytics />
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}
