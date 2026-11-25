import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://no-asteroids-achievement-tracker.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "No Asteroids Achievements Tracker & Checklist",
    template: "%s | No Asteroids Tracker",
  },
  description:
    "Track all 65 No Asteroids Steam achievements, filter hidden achievements, and save your checklist progress locally in your browser.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "No Asteroids Achievement Tracker",
    title: "No Asteroids Achievements Tracker & Checklist",
    description: "A fast, private checklist for all 65 No Asteroids Steam achievements.",
  },
  twitter: {
    card: "summary_large_image",
    title: "No Asteroids Achievements Tracker & Checklist",
    description: "Track all 65 Steam achievements and keep your progress in your browser.",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="site-shell">
          <header className="site-header">
            <Link className="brand" href="/" aria-label="No Asteroids Achievement Tracker home">
              <span className="brand-mark" aria-hidden="true">NA</span>
              <span>
                <strong>No Asteroids</strong>
                <small>Achievement Tracker</small>
              </span>
            </Link>
            <nav aria-label="Main navigation">
              <Link href="/">Tracker</Link>
              <Link href="/about">About</Link>
            </nav>
          </header>
          {children}
          <footer className="site-footer">
            <div>
              <strong>No Asteroids Achievement Tracker</strong>
              <p>An independent, browser-local checklist for Steam players.</p>
            </div>
            <nav aria-label="Footer navigation">
              <Link href="/about">About</Link>
              <Link href="/privacy">Privacy</Link>
              <Link href="/disclaimer">Disclaimer</Link>
            </nav>
          </footer>
        </div>
      </body>
    </html>
  );
}
