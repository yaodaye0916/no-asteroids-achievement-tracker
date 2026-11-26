import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy",
  description: "Privacy information for the No Asteroids achievement tracker.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <main className="legal-page">
      <p className="eyebrow">Privacy</p>
      <h1>Your checklist stays on your device</h1>
      <p className="updated">Last updated: November 26, 2026</p>
      <h2>Local progress storage</h2>
      <p>The tracker saves completed achievement IDs in your browser&apos;s localStorage. That information is not sent to an account or synchronized to a database.</p>
      <h2>What this means</h2>
      <ul>
        <li>Your progress is specific to this browser and device.</li>
        <li>Clearing browser site data removes the saved checklist.</li>
        <li>Private browsing may delete progress when the session ends.</li>
      </ul>
      <h2>Analytics</h2>
      <p>The current site does not include advertising or analytics scripts. This page will be updated before either is introduced.</p>
    </main>
  );
}
