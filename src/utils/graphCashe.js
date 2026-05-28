import { buildMetroGraph } from './graphBuilder.js';


const CACHE_TTL_MS = Infinity;

let cachedGraph = null;
let cacheBuiltAt = null;

export async function getGraph() {
  const now = Date.now();
  const expired = !cacheBuiltAt || now - cacheBuiltAt > CACHE_TTL_MS;

  if (!cachedGraph || expired) {
    console.log('[GraphCache] Building metro graph from DB...');
    cachedGraph = await buildMetroGraph();
    cacheBuiltAt = now;
    console.log(`[GraphCache] Graph built with ${Object.keys(cachedGraph).length} station nodes.`);
  }

  return cachedGraph;
}

/**
 * Call this after any admin operation that adds/removes stations or lines.
 */
export function invalidateGraphCache() {
  cachedGraph = null;
  cacheBuiltAt = null;
  console.log('[GraphCache] Cache invalidated.');
}