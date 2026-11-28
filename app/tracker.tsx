"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

type AchievementNote = {
  kind: string;
  text: string;
  sourceUrls: Array<{ label: string; url: string }>;
  verifiedDate: string;
};

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
  notes?: AchievementNote[];
  sourceUrl: string;
  verifiedDate: string;
  verificationStatus: string;
};

type SortOrder = "default" | "rarest" | "common" | "name";

const STORAGE_KEY = "no-asteroids-completed-achievements-v1";
const APP_ID = 5527800;
const BACKUP_SCHEMA_VERSION = 1;
const MAX_BACKUP_SIZE = 256 * 1024;
const HASH_PREFIX = "achievement-";

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
  const [sortOrder, setSortOrder] = useState<SortOrder>("default");
  const [revealedHidden, setRevealedHidden] = useState<Set<string>>(new Set());
  const [highlightedAchievementId, setHighlightedAchievementId] = useState<string | null>(null);
  const [copiedAchievementId, setCopiedAchievementId] = useState<string | null>(null);
  const [backupMessage, setBackupMessage] = useState("");
  const importInputRef = useRef<HTMLInputElement>(null);
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

  useEffect(() => {
    function focusHashAchievement() {
      const rawHash = window.location.hash.slice(1);
      if (!rawHash.startsWith(HASH_PREFIX)) return;

      let id: string;
      try {
        id = decodeURIComponent(rawHash.slice(HASH_PREFIX.length));
      } catch {
        return;
      }

      if (!validAchievementIds.has(id)) return;
      setQuery("");
      setCategory("all");
      setStatus("all");
      setVisibility("all");
      setHighlightedAchievementId(id);
      window.setTimeout(() => {
        document.getElementById(`${HASH_PREFIX}${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 0);
    }

    focusHashAchievement();
    window.addEventListener("hashchange", focusHashAchievement);
    return () => window.removeEventListener("hashchange", focusHashAchievement);
  }, [validAchievementIds]);

  const categories = useMemo(
    () => [...new Set(achievements.map((achievement) => achievement.category))].sort(),
    [achievements],
  );

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const visibleItems = achievements
      .map((achievement, index) => ({ achievement, index }))
      .filter(({ achievement }) => {
        const canSearchDetails = !achievement.hidden || revealedHidden.has(achievement.id);
        const matchesQuery = !normalizedQuery || (canSearchDetails && `${achievement.name} ${achievement.officialDescription}`.toLowerCase().includes(normalizedQuery));
        const matchesCategory = category === "all" || achievement.category === category;
        const matchesStatus = status === "all" || (status === "completed" ? completed.has(achievement.id) : !completed.has(achievement.id));
        const matchesVisibility = visibility === "all" || (visibility === "hidden" ? achievement.hidden : !achievement.hidden);
        return matchesQuery && matchesCategory && matchesStatus && matchesVisibility;
      });

    visibleItems.sort((left, right) => {
      if (sortOrder === "name") {
        return left.achievement.name.localeCompare(right.achievement.name) || left.index - right.index;
      }
      if (sortOrder === "rarest" || sortOrder === "common") {
        const leftPercent = Number.isFinite(left.achievement.globalUnlockPercent) ? left.achievement.globalUnlockPercent : null;
        const rightPercent = Number.isFinite(right.achievement.globalUnlockPercent) ? right.achievement.globalUnlockPercent : null;
        if (leftPercent === null) return rightPercent === null ? left.index - right.index : 1;
        if (rightPercent === null) return -1;
        const difference = sortOrder === "rarest" ? leftPercent - rightPercent : rightPercent - leftPercent;
        return difference || left.index - right.index;
      }
      return left.index - right.index;
    });

    return visibleItems.map(({ achievement }) => achievement);
  }, [achievements, category, completed, query, revealedHidden, sortOrder, status, visibility]);

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

  function revealHiddenAchievement(id: string) {
    setRevealedHidden((current) => new Set(current).add(id));
  }

  function exportProgress() {
    const payload = {
      schemaVersion: BACKUP_SCHEMA_VERSION,
      appId: APP_ID,
      completedIds: achievements.map((achievement) => achievement.id).filter((id) => completed.has(id)),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `no-asteroids-progress-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setBackupMessage("Progress exported to a local JSON file.");
  }

  async function importProgress(file: File | undefined) {
    if (!file) return;
    const invalidMessage = "Invalid backup file. Your existing progress has not changed.";

    try {
      if (file.size > MAX_BACKUP_SIZE) throw new Error("Backup is larger than 256 KB.");
      const parsed: unknown = JSON.parse(await file.text());
      if (!parsed || typeof parsed !== "object") throw new Error("Backup must be a JSON object.");

      const backup = parsed as { schemaVersion?: unknown; appId?: unknown; completedIds?: unknown };
      if (backup.schemaVersion !== BACKUP_SCHEMA_VERSION || backup.appId !== APP_ID || !Array.isArray(backup.completedIds)) {
        throw new Error("Backup metadata is not compatible.");
      }
      if (!backup.completedIds.every((id) => typeof id === "string")) throw new Error("Achievement IDs must be strings.");

      const uniqueIds = [...new Set(backup.completedIds as string[])];
      const knownIds = uniqueIds.filter((id) => validAchievementIds.has(id));
      const unknownCount = uniqueIds.length - knownIds.length;
      if (uniqueIds.length > 0 && knownIds.length === 0) throw new Error("Backup contains no known achievement IDs.");

      setCompleted((current) => new Set([...current, ...knownIds]));
      setBackupMessage(`Imported ${knownIds.length} achievement${knownIds.length === 1 ? "" : "s"}${unknownCount ? `; ignored ${unknownCount} unknown ID${unknownCount === 1 ? "" : "s"}` : ""}. Existing progress was kept.`);
    } catch {
      setBackupMessage(invalidMessage);
    } finally {
      if (importInputRef.current) importInputRef.current.value = "";
    }
  }

  async function copyAchievementLink(id: string) {
    const url = `${window.location.origin}${window.location.pathname}#${HASH_PREFIX}${encodeURIComponent(id)}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedAchievementId(id);
      window.setTimeout(() => setCopiedAchievementId((current) => current === id ? null : current), 1800);
    } catch {
      window.prompt("Copy this achievement link:", url);
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
          <label>
            <span>Sort by</span>
            <select value={sortOrder} onChange={(event) => setSortOrder(event.target.value as SortOrder)}>
              <option value="default">Default</option>
              <option value="rarest">Rarest first</option>
              <option value="common">Most common first</option>
              <option value="name">Name A–Z</option>
            </select>
          </label>
        </div>

        <div className="checklist-tools">
          <div>
            <strong>Back up your checklist</strong>
            <p>Back up your checklist before clearing browser data or switching devices. Import a backup to restore progress locally.</p>
          </div>
          <div className="checklist-tool-actions">
            <button type="button" onClick={exportProgress}>Export progress</button>
            <button type="button" onClick={() => importInputRef.current?.click()}>Import progress</button>
            <input ref={importInputRef} className="visually-hidden" type="file" accept="application/json,.json" onChange={(event) => void importProgress(event.target.files?.[0])} />
          </div>
          <p className="backup-message" aria-live="polite">{backupMessage}</p>
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
              const isRevealed = !achievement.hidden || revealedHidden.has(achievement.id);
              const notes: AchievementNote[] = achievement.notes ?? (achievement.tips ? [{
                kind: "official",
                text: achievement.tips,
                sourceUrls: achievement.tipSourceUrl ? [{ label: "Source", url: achievement.tipSourceUrl }] : [],
                verifiedDate: achievement.tipVerifiedDate ?? achievement.verifiedDate,
              }] : []);
              const accessibleName = isRevealed ? achievement.name : "hidden achievement";

              return (
                <article
                  id={`${HASH_PREFIX}${achievement.id}`}
                  className={`achievement-card${isCompleted ? " completed" : ""}${highlightedAchievementId === achievement.id ? " highlighted" : ""}`}
                  key={achievement.id}
                >
                  <button className="check-button" onClick={() => toggleAchievement(achievement.id)} aria-label={`${isCompleted ? "Mark incomplete" : "Mark complete"}: ${accessibleName}`} aria-pressed={isCompleted}>
                    <span aria-hidden="true">{isCompleted ? "✓" : ""}</span>
                  </button>
                  {isRevealed ? (
                    <Image className="achievement-icon" src={isCompleted ? achievement.icon : achievement.iconLocked} alt="" width={72} height={72} />
                  ) : (
                    <div className="hidden-icon-placeholder" aria-hidden="true">?</div>
                  )}
                  <div className="achievement-copy">
                    <div className="achievement-title-row">
                      <h3>{isRevealed ? achievement.name : "Hidden achievement"}</h3>
                      {achievement.hidden && <span className="hidden-badge">Hidden</span>}
                    </div>
                    {isRevealed ? (
                      <>
                        <p>{achievement.officialDescription}</p>
                        <span className="category-label">{categoryLabels[achievement.category] ?? achievement.category}</span>
                        {notes.length > 0 && (
                          <details className="achievement-note">
                            <summary>Source-backed {notes.length === 1 ? "note" : "notes"}</summary>
                            {notes.map((note, noteIndex) => (
                              <div className="note-entry" key={`${achievement.id}-${note.kind}-${noteIndex}`}>
                                <span className={`note-kind ${note.kind}`}>{note.kind === "community" ? "Community reference — not independently tested" : "Official source"}</span>
                                <p>{note.text}</p>
                                {note.sourceUrls.length > 0 && (
                                  <div className="note-sources">
                                    {note.sourceUrls.map((source) => <a href={source.url} target="_blank" rel="noreferrer" key={source.url}>{source.label}</a>)}
                                    <span>Checked {note.verifiedDate}</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </details>
                        )}
                      </>
                    ) : (
                      <div className="hidden-achievement-copy">
                        <p>Name, description, and icon are hidden to avoid spoilers.</p>
                        <button type="button" onClick={() => revealHiddenAchievement(achievement.id)}>Reveal hidden achievement</button>
                      </div>
                    )}
                    <button className="share-link" type="button" onClick={() => void copyAchievementLink(achievement.id)}>
                      {copiedAchievementId === achievement.id ? "Link copied" : "Copy achievement link"}
                    </button>
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
            <button className="text-button" onClick={() => { setQuery(""); setCategory("all"); setStatus("all"); setVisibility("all"); setSortOrder("default"); }}>Clear filters</button>
          </div>
        )}
      </section>
    </>
  );
}
