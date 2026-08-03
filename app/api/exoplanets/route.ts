import { fallbackResponse, normalizeRows, type ExoplanetResponse } from "../../../lib/exoplanets";

const TAP_URL = "https://exoplanetarchive.ipac.caltech.edu/TAP/sync";
const QUERY = `select top 180 pl_name,hostname,disc_year,discoverymethod,pl_orbper,pl_rade,pl_masse,sy_dist,ra,dec from ps where default_flag=1 and upper(soltype) like '%CONF%' and disc_year is not null order by disc_year desc`;

export async function GET(): Promise<Response> {
  try {
    const url = `${TAP_URL}?query=${encodeURIComponent(QUERY)}&format=json`;
    const response = await fetch(url, { signal: AbortSignal.timeout(8000), headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`TAP responded with ${response.status}`);
    const rows = normalizeRows(await response.json());
    if (rows.length === 0) throw new Error("TAP returned no usable rows");
    const payload: ExoplanetResponse = { source: "live", stale: false, message: null, fetchedAt: new Date().toISOString(), items: rows };
    return Response.json(payload, { headers: { "Cache-Control": "public, max-age=900, s-maxage=900" } });
  } catch (error) {
    const reason = error instanceof Error && error.message.includes("timed out") ? "The archive took too long to respond." : "Live archive unavailable; showing a curated offline set.";
    return Response.json(fallbackResponse(reason), { headers: { "Cache-Control": "no-store" } });
  }
}
