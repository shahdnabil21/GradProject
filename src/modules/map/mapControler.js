import { getRoutePreviewService } from '../map/mapServes.js';

// ─────────────────────────────────────────────────────────────────────────────
//  GET ROUTE PREVIEW
// ─────────────────────────────────────────────────────────────────────────────
export const getRoutePreview = async (req, res) => {
  try {
    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(400).json({ message: 'from and to query params are required' });
    }

    const preview = await getRoutePreviewService(from, to);

    return res.status(200).json(preview);
  } catch (err) {
    return res.status(err.statusCode || 500).json({ message: err.message });
  }
};
