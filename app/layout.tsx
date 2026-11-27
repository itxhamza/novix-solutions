import type { Metadata, Viewport } from "next";
import { Syne, Hanken_Grotesk } from "next/font/google";
import { site } from "@/content/site";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-syne",
  display: "swap",
});
const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-hanken",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: site.seo.title,
  description: site.seo.description,
  applicationName: site.name,
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    url: "/",
    siteName: site.name,
    title: site.seo.title,
    description: site.seo.description,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: site.seo.title,
    description: site.seo.description,
  },
};

export const viewport: Viewport = {
  // The browser chrome follows the theme. These match --color-bg in
  // app/globals.css for each theme; the site's own default when neither
  // matches is dark, as in the inline script below.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f6f8" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0f14" },
  ],
  colorScheme: "dark",
};

/**
 * The studio and the site it publishes, declared once for every page. Other
 * pages point at these @ids rather than describing the studio again.
 */
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ProfessionalService",
      "@id": `${site.url}/#organization`,
      name: site.name,
      url: site.url,
      logo: `${site.url}/brand/novix-mark.svg`,
      description: site.seo.description,
      email: site.contact.email,
      sameAs: site.footer.social.map((s) => s.href),
    },
    {
      "@type": "WebSite",
      "@id": `${site.url}/#website`,
      url: site.url,
      name: site.name,
      description: site.seo.description,
      inLanguage: "en",
      publisher: { "@id": `${site.url}/#organization` },
    },
  ],
};

const THEME_SCRIPT = "(function(){try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';}document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme='dark';}})();";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${hanken.variable}`} suppressHydrationWarning>
      <head>
        {/* Sets data-theme before the first paint, so there is no flash of
            the wrong theme. suppressHydrationWarning above is because this
            adds an attribute React did not render. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
