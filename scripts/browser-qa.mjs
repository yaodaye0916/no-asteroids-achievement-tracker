import fs from "node:fs";
import path from "node:path";

const endpoint = process.argv[2] ?? "http://127.0.0.1:9222";
const outputDir = path.resolve(process.argv[3] ?? ".qa-artifacts");
fs.mkdirSync(outputDir, { recursive: true });

const target = await fetch(`${endpoint}/json/new?${encodeURIComponent("about:blank")}`, { method: "PUT" }).then((response) => response.json());
const socket = new WebSocket(target.webSocketDebuggerUrl);
const pending = new Map();
let commandId = 0;

await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});

socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (!message.id || !pending.has(message.id)) return;
  const { resolve, reject } = pending.get(message.id);
  pending.delete(message.id);
  if (message.error) reject(new Error(`${message.error.code}: ${message.error.message}`));
  else resolve(message.result);
});

function call(method, params = {}) {
  const id = ++commandId;
  socket.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
}

async function evaluate(expression) {
  const result = await call("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
  return result.result.value;
}

async function waitFor(expression, label, timeout = 10000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (await evaluate(expression)) return;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Timed out waiting for ${label}`);
}

async function screenshot(filename) {
  const result = await call("Page.captureScreenshot", { format: "png", fromSurface: true, captureBeyondViewport: false });
  fs.writeFileSync(path.join(outputDir, filename), Buffer.from(result.data, "base64"));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const checks = [];
function pass(name, detail) {
  checks.push({ name, passed: true, detail });
}

await call("Page.enable");
await call("Runtime.enable");
await call("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
await call("Page.navigate", { url: "http://127.0.0.1:3000/" });
await waitFor("document.readyState === 'complete' && document.querySelectorAll('.achievement-card').length === 65", "desktop homepage");
await waitFor("document.querySelector('.search-field input') !== null", "React hydration");
await new Promise((resolve) => setTimeout(resolve, 500));

const initial = await evaluate(`(() => ({
  title: document.title,
  cards: document.querySelectorAll('.achievement-card').length,
  notes: document.querySelectorAll('.achievement-note').length,
  background: getComputedStyle(document.querySelector('.hero-section'), '::before').backgroundImage,
  overflow: document.documentElement.scrollWidth - window.innerWidth,
  jsonLd: Boolean(document.querySelector('script[type="application/ld+json"]')),
  canonical: Boolean(document.querySelector('link[rel="canonical"]'))
}))()`);
assert(initial.title.includes("No Asteroids Achievements Tracker"), "Unexpected page title");
assert(initial.cards === 65, `Expected 65 cards, found ${initial.cards}`);
assert(initial.notes === 3, `Expected 3 notes, found ${initial.notes}`);
assert(initial.background.includes("no-asteroids-hero.webp"), "Hero background is not applied");
assert(initial.overflow <= 0, `Desktop horizontal overflow: ${initial.overflow}px`);
assert(initial.jsonLd && initial.canonical, "SEO metadata missing");
pass("Desktop render", "65 cards, hero background, 3 notes, no horizontal overflow");
pass("SEO markup", "JSON-LD and canonical link present");
await screenshot("desktop-home.png");

await evaluate("document.querySelector('.check-button').click()");
await waitFor("document.querySelectorAll('.achievement-card.completed').length === 1", "achievement completion");
const saved = await evaluate(`(() => ({
  progress: document.querySelector('.progress-orbit > p').textContent.trim(),
  storage: JSON.parse(localStorage.getItem('no-asteroids-completed-achievements-v1') || '[]')
}))()`);
assert(saved.progress.includes("1 / 65"), `Unexpected progress text: ${saved.progress}`);
assert(saved.storage.length === 1 && saved.storage[0] === "ACH_FIRST_FIND", "Completion was not saved correctly");
pass("Completion state", "First achievement updates progress to 1/65 and writes localStorage");

await call("Page.reload", { ignoreCache: false });
await waitFor("document.readyState === 'complete' && document.querySelectorAll('.achievement-card.completed').length === 1", "completion after reload");
pass("Persistence", "Completed state survives a full reload");

await evaluate(`(() => {
  const input = document.querySelector('.search-field input');
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
  setter.call(input, 'self-destruct');
  input.dispatchEvent(new Event('input', { bubbles: true }));
})()`);
await waitFor("document.querySelectorAll('.achievement-card').length === 1", "search result");
const searchName = await evaluate("document.querySelector('.achievement-card h3').textContent");
assert(searchName === "Not in the plan", `Unexpected search result: ${searchName}`);
pass("Search", "self-destruct returns only Not in the plan");

await evaluate(`(() => {
  const input = document.querySelector('.search-field input');
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
  setter.call(input, '');
  input.dispatchEvent(new Event('input', { bubbles: true }));
  const select = [...document.querySelectorAll('.filters select')].find((item) => [...item.options].some((option) => option.value === 'hidden'));
  select.value = 'hidden';
  select.dispatchEvent(new Event('change', { bubbles: true }));
})()`);
await waitFor("document.querySelectorAll('.achievement-card').length === 1 && document.querySelector('.achievement-card h3').textContent === 'Not in the plan'", "hidden filter");
pass("Hidden filter", "Hidden-only view returns the sole Steam-hidden achievement");

await call("Page.reload", { ignoreCache: false });
await waitFor("document.readyState === 'complete' && document.querySelectorAll('.achievement-card').length === 65", "filter reset after reload");
const noteCheck = await evaluate(`(() => {
  const notes = [...document.querySelectorAll('.achievement-note')];
  notes[0].open = true;
  return {
    count: notes.length,
    text: notes.map((note) => note.textContent),
    sources: notes.map((note) => note.querySelector('a')?.href)
  };
})()`);
assert(noteCheck.count === 3, "Incorrect note count");
assert(noteCheck.text.some((text) => text.includes("Lance and Slicer")), "Tools note missing");
assert(noteCheck.text.some((text) => text.includes("observation dome")), "Scope note missing");
assert(noteCheck.text.some((text) => text.includes("cleaning progress")), "Wash note missing");
assert(noteCheck.sources.every((source) => source?.startsWith("https://")), "A note source link is missing");
pass("Research notes", "All 3 notes render, expand, and include source links");

await evaluate("document.querySelector('.tracker-section').scrollIntoView({block:'start'})");
await new Promise((resolve) => setTimeout(resolve, 500));
await screenshot("desktop-tracker.png");
const visibleIcons = await evaluate("[...document.querySelectorAll('.achievement-icon')].slice(0, 8).filter((img) => img.complete && img.naturalWidth > 0).length");
assert(visibleIcons >= 4, `Too few visible icons loaded: ${visibleIcons}`);
pass("Image loading", `${visibleIcons} of the first 8 lazy icons loaded in the tracker viewport`);

await evaluate("window.confirm = () => true; document.querySelector('.progress-orbit .text-button').click()");
await waitFor("document.querySelectorAll('.achievement-card.completed').length === 0 && JSON.parse(localStorage.getItem('no-asteroids-completed-achievements-v1') || '[]').length === 0", "progress reset");
pass("Reset", "Reset clears the UI and localStorage");

await call("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 2, mobile: true, screenWidth: 390, screenHeight: 844 });
await call("Page.reload", { ignoreCache: false });
await waitFor("document.readyState === 'complete' && document.querySelectorAll('.achievement-card').length === 65", "mobile homepage");
await new Promise((resolve) => setTimeout(resolve, 400));
const mobile = await evaluate(`(() => ({
  viewport: window.innerWidth,
  scrollWidth: document.documentElement.scrollWidth,
  heroWidth: document.querySelector('.hero-section').getBoundingClientRect().width,
  cardWidth: document.querySelector('.achievement-card').getBoundingClientRect().width,
  filterColumns: getComputedStyle(document.querySelector('.filters')).gridTemplateColumns,
  background: getComputedStyle(document.querySelector('.hero-section'), '::before').backgroundImage
}))()`);
assert(mobile.scrollWidth <= mobile.viewport, `Mobile horizontal overflow: ${mobile.scrollWidth - mobile.viewport}px`);
assert(mobile.heroWidth <= mobile.viewport && mobile.cardWidth <= mobile.viewport, "Mobile content exceeds viewport");
assert(!mobile.filterColumns.includes(" "), `Mobile filters are not single-column: ${mobile.filterColumns}`);
assert(mobile.background.includes("no-asteroids-hero.webp"), "Mobile hero background missing");
pass("Mobile layout", "390×844 viewport has no horizontal overflow; filters collapse to one column");
await evaluate("window.scrollTo(0, 0)");
await screenshot("mobile-home.png");
await evaluate("document.querySelector('.tracker-section').scrollIntoView({block:'start'})");
await new Promise((resolve) => setTimeout(resolve, 400));
await screenshot("mobile-tracker.png");

console.log(JSON.stringify({ passed: true, checks, screenshots: fs.readdirSync(outputDir).map((name) => path.join(outputDir, name)) }, null, 2));
socket.close();
