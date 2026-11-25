import Link from "next/link";

export default function NotFound() {
  return (
    <main className="legal-page">
      <p className="eyebrow">404 · Lost in orbit</p>
      <h1>This page drifted away</h1>
      <p>The achievement tracker is still safely back at the ship.</p>
      <p><Link href="/">Return to the tracker</Link></p>
    </main>
  );
}
