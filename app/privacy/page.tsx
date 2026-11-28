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
      <p className="updated">Last updated: November 28, 2026</p>
      <h2>Local progress storage</h2>
      <p>The tracker saves completed achievement IDs in your browser&apos;s localStorage. That information is not sent to an account or synchronized to a database.</p>
      <h2>What this means</h2>
      <ul>
        <li>Your progress is specific to this browser and device.</li>
        <li>Clearing browser site data removes the saved checklist.</li>
        <li>Private browsing may delete progress when the session ends.</li>
      </ul>
      <h2>Checklist backups</h2>
      <p>You can export your checklist to a local JSON file and import it on another device. Backup files are processed in your browser and are not uploaded by the tracker.</p>
      <h2>Analytics</h2>
      <p>The site uses Google Tag Manager to load Google Analytics. These tools help measure visits and interactions so the site can be improved. Google Analytics processes device, browser, and usage information and currently sets analytics cookies on this site. The site does not currently provide an on-site analytics consent control. The tracker does not use Google Tag Manager to upload your checklist or backup files, and no advertising tag was found in the production container when this notice was updated.</p>
    </main>
  );
}
