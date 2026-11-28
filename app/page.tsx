import achievementsData from "../data/achievements.json";
import AchievementTracker from "./tracker";

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "No Asteroids Achievement Tracker",
    applicationCategory: "GameApplication",
    operatingSystem: "Any web browser",
    description: "Track all 65 No Asteroids Steam achievements with a private browser-local checklist.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <AchievementTracker achievements={achievementsData.achievements} raritySnapshotDate={achievementsData.source.globalStatsRetrievedDate} />
      <section className="update-section" aria-labelledby="patch-notes-title">
        <div>
          <p className="eyebrow">Game updates</p>
          <h2 id="patch-notes-title">Achievement-related patch notes</h2>
        </div>
        <div>
          <p>Recent updates address co-op achievement issues and unreachable asteroid fragments. No Rush also has an optional blackout prevention setting. Custom asteroid beta saves are separate from the main campaign; Steam achievement eligibility in custom games has not been confirmed here.</p>
          <p className="checked-date">Patch notes checked November 28, 2026</p>
          <a href="https://steamcommunity.com/app/5527800/allnews/" target="_blank" rel="noreferrer">See the official Steam announcements</a>
        </div>
      </section>
      <section className="content-section" aria-labelledby="how-it-works">
        <div>
          <p className="eyebrow">Private by design</p>
          <h2 id="how-it-works">Your checklist stays in this browser</h2>
        </div>
        <div className="content-grid">
          <article>
            <span>01</span>
            <h3>Check achievements off</h3>
            <p>Select any achievement as you earn it. Your total and category progress update immediately.</p>
          </article>
          <article>
            <span>02</span>
            <h3>Pick up where you left off</h3>
            <p>Progress is saved with localStorage. No account, sign-in, or cloud database is required.</p>
          </article>
          <article>
            <span>03</span>
            <h3>Use verified source data</h3>
            <p>Names, descriptions, icons, and rarity figures come from Steam public achievement data.</p>
          </article>
        </div>
      </section>
      <section className="faq-section" aria-labelledby="faq-title">
        <p className="eyebrow">Quick answers</p>
        <h2 id="faq-title">No Asteroids achievement FAQ</h2>
        <details>
          <summary>How many achievements does No Asteroids have?</summary>
          <p>No Asteroids currently has 65 Steam achievements. This tracker uses the public Steam schema checked on November 28, 2026.</p>
        </details>
        <details>
          <summary>Does the tracker upload my progress?</summary>
          <p>No. Completed achievement IDs are stored only in your current browser. Clearing site data will remove that progress.</p>
        </details>
        <details>
          <summary>Are hidden achievements included?</summary>
          <p>Yes. Steam currently marks one achievement as hidden. You can include or isolate hidden achievements with the filters.</p>
        </details>
      </section>
    </main>
  );
}
