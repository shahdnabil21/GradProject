import { Station, Category } from '../../DB/model/index.js';
import { getGraph } from '../../utils/graphCashe.js';
import { findShortestPath } from '../../utils/shortTestPath.js';

// ─────────────────────────────────────────────────────────────────────────────
//  GET ROUTE PREVIEW
//  No ticket created, no DB writes — purely for display purposes.
// ─────────────────────────────────────────────────────────────────────────────
export const getRoutePreviewService = async (fromStationId, toStationId) => {
  // Validate both stations exist
  const [fromStation, toStation] = await Promise.all([
    Station.findById(fromStationId),
    Station.findById(toStationId),
  ]);

  if (!fromStation) {
    const error = new Error('Origin station not found');
    error.statusCode = 404;
    throw error;
  }

  if (!toStation) {
    const error = new Error('Destination station not found');
    error.statusCode = 404;
    throw error;
  }

  // Run shortest path
  const graph = await getGraph();
  const result = findShortestPath(graph, fromStationId.toString(), toStationId.toString());

  if (!result.found) {
    const error = new Error('No route found between these two stations');
    error.statusCode = 400;
    throw error;
  }

  const { stops, path, transfers } = result;

  // Find the cheapest category that covers this journey
  const requiredCategory = await Category.findOne({ numberOfStations: { $gte: stops } })
    .sort({ numberOfStations: 1 });

  // Hydrate all station names in the path in one DB call
  const stationDocs = await Station.find({ _id: { $in: path } });
  const stationMap = Object.fromEntries(
    stationDocs.map(s => [s._id.toString(), s])
  );

  // Build the full path with station names and transfer flags
  const pathDetails = path.map((id, index) => ({
    id,
    name: stationMap[id]?.name || id,
    nameAr: stationMap[id]?.nameAr || id,
    isTransfer: transfers.includes(id),
    order: index + 1,
  }));

  return {
    from: {
      id: fromStation._id,
      name: fromStation.name,
      nameAr: fromStation.nameAr,
    },
    to: {
      id: toStation._id,
      name: toStation.name,
      nameAr: toStation.nameAr,
    },
    stops,
    path: pathDetails,
    transfers: transfers.map(id => ({
      id,
      name: stationMap[id]?.name || id,
      nameAr: stationMap[id]?.nameAr || id,
    })),
    requiredTicket: requiredCategory
      ? {
          id: requiredCategory._id,
          name: requiredCategory.name,
          maxStations: requiredCategory.numberOfStations,
          price: requiredCategory.price,
        }
      : null,
  };
};
