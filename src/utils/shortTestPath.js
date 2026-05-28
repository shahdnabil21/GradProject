
export function findShortestPath(graph, startId, endId) {
  if (startId === endId) {
    return { path: [startId], stops: 0, transfers: [], found: true };
  }

  if (!graph[startId] || !graph[endId]) {
    return { path: [], stops: 0, transfers: [], found: false };
  }

  // BFS - each node in queue tracks: stationId + currentLineId + path so far
  const queue = [{ stationId: startId, lineId: null, path: [startId] }];
  const visited = new Set([startId]);

  while (queue.length > 0) {
    const { stationId, lineId, path } = queue.shift();

    for (const edge of (graph[stationId] || [])) {
      const nextId = edge.stationId;

      // Skip already-visited (for non-transfer edges only)
      // Transfer edges loop back to same station with different lineId context
      if (!edge.isTransfer && visited.has(nextId)) continue;
      if (edge.isTransfer && visited.has(`${nextId}_${edge.lineId}`)) continue;

      const newPath = [...path, ...(edge.isTransfer ? [] : [nextId])];

      if (nextId === endId && !edge.isTransfer) {
        // Found the destination — compute transfers
        const transfers = detectTransfers(newPath, graph);
        return {
          path: newPath,
          stops: newPath.length,  // number of edges = stations traveled
          transfers,
          found: true,
        };
      }

      if (edge.isTransfer) {
        visited.add(`${nextId}_${edge.lineId}`);
        queue.push({ stationId: nextId, lineId: edge.lineId, path });
      } else {
        visited.add(nextId);
        queue.push({ stationId: nextId, lineId: edge.lineId, path: newPath });
      }
    }
  }

  return { path: [], stops: 0, transfers: [], found: false };
}

/**
 * Detects transfer stations in a path by finding where the line changes.
 * A transfer happens when consecutive stations share no common line.
 */
function detectTransfers(path, graph) {
  const transfers = [];

  for (let i = 1; i < path.length - 1; i++) {
    const prevEdges = graph[path[i - 1]] || [];
    const nextEdges = graph[path[i + 1]] || [];

    const prevLines = new Set(
      prevEdges.filter(e => e.stationId === path[i] && !e.isTransfer).map(e => e.lineId)
    );
    const nextLines = new Set(
      nextEdges.filter(e => e.stationId === path[i] && !e.isTransfer).map(e => e.lineId)
    );

    const commonLines = [...prevLines].filter(l => nextLines.has(l));
    if (commonLines.length === 0) {
      transfers.push(path[i]);
    }
  }

  return transfers;
}