export type Exoplanet = {
  id: string;
  name: string;
  hostStar: string;
  discoveryYear: number | null;
  discoveryMethod: string;
  orbitalPeriod: number | null;
  radius: number | null;
  mass: number | null;
  distance: number | null;
  rightAscension: number | null;
  declination: number | null;
  system: string;
};

export type DataSource = "live" | "fallback";

export type ExoplanetResponse = {
  source: DataSource;
  stale: boolean;
  message: string | null;
  fetchedAt: string;
  items: Exoplanet[];
};

const FALLBACK_ROWS: Exoplanet[] = [
  { id: "kepler-186-f", name: "Kepler-186 f", hostStar: "Kepler-186", discoveryYear: 2014, discoveryMethod: "Transit", orbitalPeriod: 129.9, radius: 1.11, mass: null, distance: 151.4, rightAscension: null, declination: null, system: "Kepler-186" },
  { id: "trappist-1-e", name: "TRAPPIST-1 e", hostStar: "TRAPPIST-1", discoveryYear: 2017, discoveryMethod: "Transit", orbitalPeriod: 6.1, radius: 0.92, mass: 0.69, distance: 12.43, rightAscension: null, declination: null, system: "TRAPPIST-1" },
  { id: "51-peg-b", name: "51 Pegasi b", hostStar: "51 Pegasi", discoveryYear: 1995, discoveryMethod: "Radial Velocity", orbitalPeriod: 4.23, radius: null, mass: 0.47, distance: 15.6, rightAscension: null, declination: null, system: "51 Pegasi" },
  { id: "hd-209458-b", name: "HD 209458 b", hostStar: "HD 209458", discoveryYear: 1999, discoveryMethod: "Transit", orbitalPeriod: 3.52, radius: 1.38, mass: 0.73, distance: 47.0, rightAscension: null, declination: null, system: "HD 209458" },
  { id: "proxima-cen-b", name: "Proxima Centauri b", hostStar: "Proxima Centauri", discoveryYear: 2016, discoveryMethod: "Radial Velocity", orbitalPeriod: 11.2, radius: null, mass: 1.07, distance: 1.3, rightAscension: null, declination: null, system: "Proxima Centauri" },
  { id: "55-cancri-e", name: "55 Cancri e", hostStar: "55 Cancri", discoveryYear: 2004, discoveryMethod: "Radial Velocity", orbitalPeriod: 0.74, radius: 1.88, mass: 8.0, distance: 12.6, rightAscension: null, declination: null, system: "55 Cancri" },
  { id: "wasp-12-b", name: "WASP-12 b", hostStar: "WASP-12", discoveryYear: 2008, discoveryMethod: "Transit", orbitalPeriod: 1.09, radius: 1.90, mass: 1.47, distance: 427.0, rightAscension: null, declination: null, system: "WASP-12" },
  { id: "gj-1214-b", name: "GJ 1214 b", hostStar: "GJ 1214", discoveryYear: 2009, discoveryMethod: "Transit", orbitalPeriod: 1.58, radius: 2.74, mass: 6.26, distance: 14.6, rightAscension: null, declination: null, system: "GJ 1214" },
];

export function fallbackResponse(message = "Live archive unavailable; showing a curated offline set."): ExoplanetResponse {
  return { source: "fallback", stale: true, message, fetchedAt: new Date().toISOString(), items: FALLBACK_ROWS };
}

function numberOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? number : null;
}

export function normalizeRow(row: Record<string, unknown>): Exoplanet | null {
  const rawName = row.pl_name ?? row.plName;
  if (typeof rawName !== "string" || rawName.trim().length === 0) return null;
  const name = rawName.trim();
  const hostStar = typeof row.hostname === "string" ? row.hostname : name.replace(/\s+[bcdefghijk]$/i, "");
  const system = hostStar || name;
  return {
    id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    name,
    hostStar,
    discoveryYear: numberOrNull(row.disc_year),
    discoveryMethod: typeof row.discoverymethod === "string" && row.discoverymethod.trim() ? row.discoverymethod.trim() : "Not recorded",
    orbitalPeriod: numberOrNull(row.pl_orbper),
    radius: numberOrNull(row.pl_rade),
    mass: numberOrNull(row.pl_masse),
    distance: numberOrNull(row.sy_dist),
    rightAscension: (() => { const value = numberOrNull(row.ra); return value !== null && value >= 0 && value <= 360 ? value : null; })(),
    declination: (() => { const value = numberOrNull(row.dec); return value !== null && value >= -90 && value <= 90 ? value : null; })(),
    system,
  };
}

export function normalizeRows(rows: unknown): Exoplanet[] {
  if (!Array.isArray(rows)) return [];
  return rows.map((row) => (row && typeof row === "object" ? normalizeRow(row as Record<string, unknown>) : null)).filter((row): row is Exoplanet => row !== null);
}

export { FALLBACK_ROWS };
