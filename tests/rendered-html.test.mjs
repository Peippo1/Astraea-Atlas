import assert from "node:assert/strict";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${path}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }), { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } }, { waitUntil() {}, passThroughOnException() {} });
}

test("renders Astraea Atlas metadata and experience shell", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /<title>Astraea Atlas/);
  assert.match(html, /ASTRAEA/);
  assert.match(html, /LIVE ARCHIVE VIEW/);
  assert.match(html, /Detection method/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/);
});

test("exposes the normalized data route", async () => {
  const response = await render("/api/exoplanets");
  assert.equal(response.status, 200);
  const payload = await response.json();
  assert.ok(["live", "fallback"].includes(payload.source));
  assert.equal(typeof payload.stale, "boolean");
  assert.ok(Array.isArray(payload.items));
  assert.ok(payload.items.length > 0);
  assert.ok(payload.items.every((item) => typeof item.name === "string" && typeof item.discoveryMethod === "string"));
});
