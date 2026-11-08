import type { Metadata } from "next";
import { Hanken_Grotesk, Newsreader } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import ThemeToggle from "@/components/ThemeToggle";

const sans = Hanken_Grotesk({
  variable: "--font-sans",
  subsets: ["latin"],
});

const serif = Newsreader({
  variable: "--font-serif",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
});

const SITE_URL = "https://bibdle.app";
const TITLE = "Bibdle: the daily Bible guessing game";
const DESCRIPTION =
  "A new Bible puzzle every day. Play Classic, Quote, Emoji, Verse, and Scripture or Shakespeare.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: "Bibdle",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const themeInit = `(function(){try{var t=localStorage.getItem('bibdle:theme');if(t!=='light'&&t!=='dark'){t='dark';}document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme='dark';}})();`;

  return (
    <html
      lang="en"
      className={`${sans.variable} ${serif.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body>
        <ThemeToggle />
        {children}
        <footer className="siteDisclaimer">
          <p>
            Chat replies and other non-scripture content are AI-generated and
            may contain mistakes. Scripture quotations are from the King James
            Version (public domain).
          </p>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
