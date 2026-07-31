import assert from "node:assert/strict";
import test from "node:test";

const { normalizeRows } = await import("../lib/exoplanets.ts");

test("normalizes valid archive rows and preserves unavailable measurements", () => {
  const [planet] = normalizeRows([{ pl_name: "Demo b", hostname: "Demo", disc_year: "2020", discoverymethod: "Transit", pl_orbper: "3.2", pl_rade: "1.1", pl_masse: null, sy_dist: "10" }]);
  assert.deepEqual(planet, { id: "demo-b", name: "Demo b", hostStar: "Demo", discoveryYear: 2020, discoveryMethod: "Transit", orbitalPeriod: 3.2, radius: 1.1, mass: null, distance: 10, system: "Demo" });
});

test("skips malformed rows without failing the dataset", () => {
  const rows = normalizeRows([null, {}, { pl_name: "", hostname: "Nope" }, { pl_name: "Good c", discoverymethod: "Imaging" }]);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].name, "Good c");
  assert.equal(rows[0].radius, null);
});
