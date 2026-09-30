// Run with: node test.js (standard library only).
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");

let now = "2026-10-01T16:30:00Z";
class ClockDate extends Date {
  constructor(...args) { super(...(args.length ? args : [now])); }
}
const elements = new Map();
function element(id) {
  if (!elements.has(id)) elements.set(id, {
    textContent: "", value: "", disabled: false, attributes: {}, listeners: {},
    classList: { toggle() {}, add() {}, remove() {} },
    addEventListener(type, handler) { this.listeners[type] = handler; },
    setAttribute(name, value) { this.attributes[name] = value; }
  });
  return elements.get(id);
}
const sides = ["West", "East"].map(side => Object.assign(element(side), { dataset: { side } }));
let initialize;
let stored = '{"street":"__proto__","side":"East"}';
const context = vm.createContext({
  Date: ClockDate, Intl, TextEncoder, console, navigator: {},
  setInterval() {}, setTimeout() {}, clearTimeout() {},
  localStorage: { getItem() { return stored; }, setItem(key, value) { stored = value; } },
  document: {
    getElementById: element, querySelector: element, querySelectorAll() { return sides; },
    addEventListener(type, handler) { if (type === "DOMContentLoaded") initialize = handler; }
  }
});
vm.runInContext(fs.readFileSync(path.join(__dirname, "app.js"), "utf8") +
  "\nglobalThis.engine = { PARKING_DATA, getNextCleaningDate, isParkingSeason, getCleaningEnd, formatCountdown, generateICS, updateUI, montrealDate };", context);
const e = context.engine;
const rule = e.PARKING_DATA.brebeuf.sides.East;
for (const [reference, expected] of [
  ["2026-10-01T16:29:59Z", "2026-10-01T16:30:00.000Z"],
  ["2026-10-01T16:30:00Z", "2026-10-01T16:30:00.000Z"],
  ["2026-10-01T17:29:59Z", "2026-10-01T16:30:00.000Z"],
  ["2026-10-01T17:30:00Z", "2026-10-08T16:30:00.000Z"],
  ["2026-11-01T04:00:00Z", "2026-11-05T17:30:00.000Z"],
  ["2026-12-02T05:00:00Z", "2027-04-01T16:30:00.000Z"],
  ["2026-12-31T23:00:00Z", "2027-04-01T16:30:00.000Z"],
  ["2027-01-01T05:00:00Z", "2027-04-01T16:30:00.000Z"],
  ["2027-03-31T23:00:00Z", "2027-04-01T16:30:00.000Z"]
]) assert.equal(e.getNextCleaningDate(rule, new Date(reference)).toISOString(), expected);
for (const [reference, active] of [
  ["2026-04-01T03:59:59Z", false], ["2026-04-01T04:00:00Z", true],
  ["2026-12-02T04:59:59Z", true], ["2026-12-02T05:00:00Z", false]
]) assert.equal(e.isParkingSeason(new Date(reference)), active);
const tuesday = e.PARKING_DATA.christophe.sides.East;
assert.equal(e.getNextCleaningDate(tuesday, new Date("2026-12-01T15:30:00Z")).toISOString(), "2026-12-01T15:00:00.000Z");
assert.equal(e.getNextCleaningDate(tuesday, new Date("2026-12-01T16:00:00Z")).toISOString(), "2027-04-06T14:00:00.000Z");
const next = new Date("2026-10-01T16:30:00Z");
assert.match(e.formatCountdown(next, next, rule).text, /In progress/);
assert.equal(e.formatCountdown(next, new Date("2026-10-01T17:30:00Z"), rule).text, "Completed");
assert.match(e.formatCountdown(next, new Date("2026-10-01T17:45:00Z"), { ...rule, endHour: 15 }).text, /In progress/);
assert.equal(e.formatCountdown(next, new Date("2026-10-01T03:30:00Z"), rule).text, "Tomorrow");
assert.equal(e.formatCountdown(next, new Date("2026-10-01T16:29:59Z"), rule).text, "In 1 min");

for (const street of Object.values(e.PARKING_DATA)) for (const r of Object.values(street.sides)) {
  for (const reference of ["2026-01-01", "2026-03-29", "2026-07-01", "2026-11-29", "2026-12-30"]) {
    const ref = new Date(reference + "T18:00:00Z");
    const start = e.getNextCleaningDate(r, ref);
    const wall = e.montrealDate(start);
    assert.equal(e.isParkingSeason(start), true);
    assert.equal(wall.getUTCDay(), r.dayIndex);
    assert.equal(wall.getUTCHours(), r.startHour);
    assert.equal(wall.getUTCMinutes(), r.startMin);
    assert.ok(e.getCleaningEnd(r, start) > ref);
  }
}
const ics = e.generateICS("Rue, Brébeuf; \\ test", "East", rule, next);
const unfolded = ics.replace(/\r\n /g, "");
assert.ok(unfolded.includes("DTSTART:20261001T163000Z\r\nDTEND:20261001T173000Z"));
assert.ok(unfolded.includes("TRIGGER:-PT2H"));
assert.ok(unfolded.includes("LOCATION:Rue\\, Brébeuf\\; \\\\ test\\, Montréal\\, QC"));
assert.ok(unfolded.includes("\\nReminder 2 hours before."));
assert.ok(ics.endsWith("END:VCALENDAR\r\n"));
for (const line of ics.split("\r\n")) assert.ok(Buffer.byteLength(line) <= 75);
assert.equal(unfolded.match(/^UID:.*$/m)[0], e.generateICS("Rue, Brébeuf; \\ test", "East", rule, next).replace(/\r\n /g, "").match(/^UID:.*$/m)[0]);

initialize(); // Invalid stored keys must fall back safely.
assert.equal(element("street-select").value, "brebeuf");
assert.equal(element("btn-set-reminder").disabled, true);
assert.equal(element("East").attributes["aria-pressed"], "true");
now = "2026-10-01T17:30:00Z";
e.updateUI();
assert.equal(element("btn-set-reminder").disabled, false);
element("West").listeners.click();
assert.match(element("street-notes").textContent, /prohibited at all times/);
assert.equal(element("street-bounds").textContent, "Saint-Joseph → Gilford");
assert.equal(JSON.parse(stored).side, "West");
element("street-select").listeners.change({ target: { value: "roche" } });
element("East").listeners.click();
assert.match(element("street-notes").textContent, /1:30–2:30 PM/);
stored = "invalid JSON";
assert.doesNotThrow(initialize);
context.localStorage.getItem = () => { throw new Error("Storage blocked"); };
context.localStorage.setItem = () => { throw new Error("Storage blocked"); };
assert.doesNotThrow(initialize);
assert.doesNotThrow(() => element("West").listeners.click());
console.log("OK: Montréal timezone, season edges, cleaning windows, calendar format, saved selection and UI states.");

async function checkServiceWorker() {
  class CheckResponse {
    constructor(content, options = {}) { this.content = content; this.status = options.status || 200; this.ok = this.status < 400; }
    clone() { return new CheckResponse(this.content, { status: this.status }); }
    async text() { return this.content; }
    static error() { return new CheckResponse("", { status: 500 }); }
  }
  const handlers = {};
  const scope = "https://example.com/Brebeuf-Park/";
  const cacheName = `brebeuf-park-${scope}-v2`;
  const cached = new Map();
  const deleted = [];
  let networkFails = false;
  let networkStatus = 200;
  let claimed = false;
  let skipped = false;
  const cache = {
    async addAll(assets) { for (const asset of assets) cached.set(asset, new CheckResponse("offline")); },
    async put(request, response) { cached.set(request.url, response); },
    async match(request) { return cached.get(request.url || request)?.clone(); }
  };
  const worker = vm.createContext({
    URL, Response: CheckResponse,
    self: { registration: { scope },
      addEventListener(name, handler) { handlers[name] = handler; },
      async skipWaiting() { skipped = true; }, clients: { async claim() { claimed = true; } }
    },
    caches: {
      async open(name) { assert.equal(name, cacheName); return cache; },
      async keys() { return [cacheName, `brebeuf-park-${scope}-v1`, "brebeuf-park-v1", "another-app-cache"]; },
      async delete(key) { deleted.push(key); }
    },
    async fetch(request, options) {
      assert.equal(options.cache, "no-cache");
      if (networkFails) throw new Error("Offline");
      return new CheckResponse("fresh", { status: networkStatus });
    }
  });
  vm.runInContext(fs.readFileSync(path.join(__dirname, "sw.js"), "utf8"), worker);
  let pending;
  handlers.install({ waitUntil(promise) { pending = promise; } });
  await pending;
  assert.ok(skipped && cached.has("./app.js?v=2") && cached.has("./style.css?v=2"));
  handlers.activate({ waitUntil(promise) { pending = promise; } });
  await pending;
  assert.ok(claimed && deleted.includes("brebeuf-park-v1"));
  assert.ok(!deleted.includes("another-app-cache") && !deleted.includes(cacheName));
  async function request(url, mode = "cors", method = "GET") {
    const waits = [];
    let response;
    handlers.fetch({ request: { url, mode, method },
      waitUntil(promise) { waits.push(promise); }, respondWith(promise) { response = promise; }
    });
    const result = await response;
    await Promise.all(waits);
    return result;
  }
  const url = scope + "app.js?v=2";
  assert.equal(await (await request(url)).text(), "fresh");
  networkFails = true;
  assert.equal(await (await request(url)).text(), "fresh");
  assert.equal(await (await request(scope + "?from=homescreen", "navigate")).text(), "offline");
  assert.equal(await request("https://example.com/another-app/"), undefined);
  assert.equal(await request(url, "cors", "POST"), undefined);
  networkFails = false;
  networkStatus = 404;
  assert.equal((await request(url)).status, 404);
  networkFails = true;
  assert.equal(await (await request(url)).text(), "fresh");
  console.log("OK: fresh network assets, offline fallback, update activation and cache isolation.");
}
checkServiceWorker().catch(error => { console.error(error); process.exitCode = 1; });
