import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "About the independent No Asteroids achievement tracker and its data sources.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <main className="legal-page">
      <p className="eyebrow">About this project</p>
      <h1>A focused checklist for achievement hunters</h1>
      <p>No Asteroids Achievement Tracker is an independent tool for players who want one clear place to browse all achievements and track what they have completed.</p>
      <h2>Where the data comes from</h2>
      <p>Achievement names, official descriptions, visibility flags, icons, and global unlock percentages come from Steam&apos;s public achievement data for app 5527800. The dataset was last checked on November 28, 2026. Global unlock percentages are a dated snapshot and will change as more players earn achievements.</p>
      <h2>What we verify</h2>
      <p>Official metadata is separated from original guide text. Practical unlock instructions and tips are only added after they can be supported by gameplay evidence, developer information, or reliable independent reports.</p>
      <h2>Contact and corrections</h2>
      <p>Found an incorrect achievement detail? Report it in our <a href="https://github.com/yaodaye0916/no-asteroids-achievement-tracker/issues" target="_blank" rel="noreferrer">GitHub issues</a> with the achievement name, game version, and a source or screenshot when possible. Please do not include personal information.</p>
    </main>
  );
}
