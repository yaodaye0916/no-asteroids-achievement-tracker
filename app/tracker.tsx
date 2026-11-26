"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type Achievement = {
  id: string;
  internalKey: number;
  name: string;
  officialDescription: string;
  icon: string;
  iconLocked: string;
  hidden: boolean;
  archived: boolean;
  globalUnlockPercent: number;
  category: string;
  unlockCondition: string | null;
  tips: string | null;
  tipSourceUrl?: string;
  tipVerifiedDate?: string;
  sourceUrl: string;
  verifiedDate: string;
  verificationStatus: string;
};

const STORAGE_KEY = "no-asteroids-completed-achievements-v1";

const categoryLabels: Record<string, string> = {
  "economy-and-orders": "Economy & orders",
  "endings-and-challenges": "Endings & challenges",
  "equipment-and-ship-systems": "Equipment & ship systems",
  "exploration-and-events": "Exploration & events",
  "museum-and-finds": "Museum & finds",
  "progress-milestones": "Progress milestones",
  "ship-life-and-interactions": "Ship life & interactions",
};

export default function AchievementTracker({ achievements, raritySnapshotDate }: { achievements: Achievement[]; raritySnapshotDate: string }) {
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [visibility, setVisibility] = useState("all");
  const validAchievementIds = useMemo(() => new Set(achievements.map((achievement) => achievement.id)), [achievements]);

  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
      if (Array.isArray(saved)) {
        setCompleted(new Set(saved.filter((id): id is string => typeof id === "string" && validAchievementIds.has(id))));
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setLoaded(true);
    }
  }, [validAchievementIds]);

  useEffect(() => {
    if (loaded) window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...completed]));
  }, [completed, loaded]);

  const categories = useMemo(
    () => [...new Set(achievements.map((achievement) => achievement.category))].sort(),
    [achievements],
  );

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return achievements.filter((achievement) => {
      const matchesQuery = !normalizedQuery || `${achievement.name} ${achievement.officialDescription}`.toLowerCase().includes(normalizedQuery);
      const matchesCategory = category === "all" || achievement.category === category;
      const matchesStatus = status === "all" || (status === "completed" ? completed.has(achievement.id) : !completed.has(achievement.id));
      const matchesVisibility = visibility === "all" || (visibility === "hidden" ? achievement.hidden : !achievement.hidden);
      return matchesQuery && matchesCategory && matchesStatus && matchesVisibility;
    });
  }, [achievements, category, completed, query, status, visibility]);

  const completedCount = completed.size;
  const percent = achievements.length ? Math.round((completedCount / achievements.length) * 100) : 0;

  function toggleAchievement(id: string) {
    setCompleted((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function resetProgress() {
    if (completed.size && window.confirm("Reset all completed achievements? This cannot be undone.")) {
      setCompleted(new Set());
    }
  }

  return (
    <>
      <section className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow"><span /> All 65 Steam achievements</p>
          <h1>No Asteroids<br /><em>achievement tracker</em></h1>
          <p className="hero-lead">Search every achievement, filter the list, and keep a private completion checklist in your browser.</p>
          <div className="hero-meta">
            <span>65 achievements</span>
            <span>7 categories</span>
            <span>1 hidden</span>
          </div>
        </div>
        <aside className="progress-orbit" aria-label={`${completedCount} of ${achievements.length} achievements completed`}>
          <div className="orbit-ring" style={{ "--progress": `${percent * 3.6}deg` } as React.CSSProperties}>
            <div>
              <strong>{percent}%</strong>
              <span>complete</span>
            </div>
          </div>
          <p><strong>{completedCount}</strong> / {achievements.length} earned</p>
          <div className="linear-progress" aria-hidden="true"><span style={{ width: `${percent}%` }} /></div>
          <button className="text-button" onClick={resetProgress} disabled={!completedCount}>Reset progress</button>
        </aside>
      </section>

      <section className="tracker-section" aria-labelledby="tracker-title">
        <div className="tracker-heading">
          <div>
            <p className="eyebrow">Checklist</p>
            <h2 id="tracker-title">Find your next achievement</h2>
          </div>
          <p>Showing <strong>{filtered.length}</strong> of {achievements.length} · Steam rarity snapshot: {raritySnapshotDate}</p>
        </div>

        <div className="filters" role="search">
          <label className="search-field">
            <span>Search achievements</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name or description…" />
          </label>
          <label>
            <span>Category</span>
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              <option value="all">All categories</option>
              {categories.map((item) => <option key={item} value={item}>{categoryLabels[item] ?? item}</option>)}
            </select>
          </label>
          <label>
            <span>Status</span>
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="all">All statuses</option>
              <option value="incomplete">Not completed</option>
              <option value="completed">Completed</option>
            </select>
          </label>
          <label>
            <span>Visibility</span>
            <select value={visibility} onChange={(event) => setVisibility(event.target.value)}>
              <option value="all">All achievements</option>
              <option value="hidden">Hidden only</option>
              <option value="visible">Visible only</option>
            </select>
          </label>
        </div>

        <div className="category-progress" aria-label="Progress by category">
          {categories.map((item) => {
            const categoryItems = achievements.filter((achievement) => achievement.category === item);
            const done = categoryItems.filter((achievement) => completed.has(achievement.id)).length;
            return (
              <button key={item} className={category === item ? "active" : ""} onClick={() => setCategory(category === item ? "all" : item)}>
                <span>{categoryLabels[item] ?? item}</span><strong>{done}/{categoryItems.length}</strong>
              </button>
            );
          })}
        </div>

        {filtered.length ? (
          <div className="achievement-list">
            {filtered.map((achievement) => {
              const isCompleted = completed.has(achievement.id);
              return (
                <article className={`achievement-card${isCompleted ? " completed" : ""}`} key={achievement.id}>
                  <button className="check-button" onClick={() => toggleAchievement(achievement.id)} aria-label={`${isCompleted ? "Mark incomplete" : "Mark complete"}: ${achievement.name}`} aria-pressed={isCompleted}>
                    <span aria-hidden="true">{isCompleted ? "✓" : ""}</span>
                  </button>
                  <Image className="achievement-icon" src={isCompleted ? achievement.icon : achievement.iconLocked} alt="" width={72} height={72} />
                  <div className="achievement-copy">
                    <div className="achievement-title-row">
                      <h3>{achievement.name}</h3>
                      {achievement.hidden && <span className="hidden-badge">Hidden</span>}
                    </div>
                    <p>{achievement.officialDescription}</p>
                    <span className="category-label">{categoryLabels[achievement.category] ?? achievement.category}</span>
                    {achievement.tips && (
                      <details className="achievement-note" suppressHydrationWarning>
                        <summary>Source-backed note</summary>
                        <p>{achievement.tips}</p>
                        {achievement.tipSourceUrl && (
                          <a href={achievement.tipSourceUrl} target="_blank" rel="noreferrer">
                            Source · checked {achievement.tipVerifiedDate ?? achievement.verifiedDate}
                          </a>
                        )}
                      </details>
                    )}
                  </div>
                  <div className="rarity">
                    <strong>{achievement.globalUnlockPercent.toFixed(1)}%</strong>
                    <span>players</span>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <strong>No achievements match these filters.</strong>
            <button className="text-button" onClick={() => { setQuery(""); setCategory("all"); setStatus("all"); setVisibility("all"); }}>Clear filters</button>
          </div>
        )}
      </section>
    </>
  );
}
