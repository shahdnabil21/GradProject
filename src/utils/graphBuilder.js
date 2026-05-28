import { LineStation } from '../DB/model/index.js';

export async function buildMetroGraph() {
  const lineStations = await LineStation.find({}).sort({ order: 1 }).lean();

  if (!lineStations.length) {
    console.warn('[GraphBuilder] No LineStation records found in DB.');
    return {};
  }

  const lineMap = {};

  for (const ls of lineStations) {
    const key = `${ls.line.toString()}_${ls.branch || 'main'}`;
    if (!lineMap[key]) lineMap[key] = [];
    lineMap[key].push({
      stationId: ls.station.toString(),
      lineId: ls.line.toString(),
      order: ls.order,
      branch: ls.branch,
    });
  }

  for (const key of Object.keys(lineMap)) {
    lineMap[key].sort((a, b) => a.order - b.order);
  }

  const graph = {};

  function addEdge(fromId, toId, lineId, weight = 1, isTransfer = false) {
    if (!graph[fromId]) graph[fromId] = [];
    if (!graph[toId]) graph[toId] = [];
    graph[fromId].push({ stationId: toId, lineId, weight, isTransfer });
    graph[toId].push({ stationId: fromId, lineId, weight, isTransfer });
  }

  for (const segment of Object.values(lineMap)) {
    for (let i = 0; i < segment.length - 1; i++) {
      addEdge(segment[i].stationId, segment[i + 1].stationId, segment[i].lineId, 1, false);
    }
  }

  const stationLines = {};
  for (const segment of Object.values(lineMap)) {
    for (const entry of segment) {
      if (!stationLines[entry.stationId]) stationLines[entry.stationId] = new Set();
      stationLines[entry.stationId].add(entry.lineId);
    }
  }

  for (const [stationId, lines] of Object.entries(stationLines)) {
    if (lines.size > 1) {
      const lineArr = [...lines];
      for (let i = 0; i < lineArr.length - 1; i++) {
        for (let j = i + 1; j < lineArr.length; j++) {
          addEdge(stationId, stationId, `transfer_${lineArr[i]}_${lineArr[j]}`, 0, true);
        }
      }
    }
  }

  return graph;
}