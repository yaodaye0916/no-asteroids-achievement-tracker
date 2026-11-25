import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Disclaimer",
  description: "Trademark, affiliation, and data-source disclaimer for the No Asteroids achievement tracker.",
  alternates: { canonical: "/disclaimer" },
};

export default function DisclaimerPage() {
  return (
    <main className="legal-page">
      <p className="eyebrow">Disclaimer</p>
      <h1>An independent, unofficial player tool</h1>
      <p>No Asteroids Achievement Tracker is not affiliated with, endorsed by, or sponsored by Unruled Games, Valve Corporation, or Steam.</p>
      <h2>Names and trademarks</h2>
      <p>No Asteroids, Steam, their logos, and associated names are the property of their respective owners. Their use here is descriptive and identifies the game and platform supported by this tracker.</p>
      <h2>Achievement data and images</h2>
      <p>Official achievement names, descriptions, and icons are retrieved from publicly accessible Steam data. All associated rights remain with their respective owners.</p>
      <h2>Accuracy</h2>
      <p>The site aims to keep data current, but game updates can change achievements and unlock behavior. Dates and verification status are retained in the source dataset so changes can be reviewed.</p>
    </main>
  );
}
