import catchAsync from '../../utils/catchAsync.js';
import {
  getAllLineStationsService,
  getLineStationService,
  addStationToLineService,
  createLineStationService,
  updateLineStationService,
  deleteLineStationService
} from './lineStation.services.js';

/**
 * GET ALL STATIONS
 * GET /stations
 */
export const getAllLineStations = catchAsync(async (req, res, next) => {
  const stations = await getAllLineStationsService();

  res.status(200).json({
    status: 'success',
    results: stations.length,
    data: stations
  });
});

/**
 * GET ONE STATION
 * GET /stations/:id
 */
export const getLineStation = catchAsync(async (req, res, next) => {
  const station = await getLineStationService(req.params.id);

  res.status(200).json({
    status: 'success',
    data: station
  });
});

export const addStationToLine = async (req, res, next) => {
  try {
    const { lineId } = req.params;
    const result = await addStationToLineService(lineId, req.body);
    res.status(201).json({ message: 'Station created and added to line', data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * CREATE STATION
 * POST /stations
 */
export const createLineStation = catchAsync(async (req, res, next) => {
  const station = await createLineStationService(req.body);

  res.status(201).json({
    status: 'success',
    data: station
  });
});

/**
 * UPDATE STATION
 * PATCH /stations/:id
 */
export const updateLineStation = catchAsync(async (req, res, next) => {
  const station = await updateLineStationService(req.params.id, req.body);

  res.status(200).json({
    status: 'success',
    data: station
  });
});

/**
 * DELETE STATION
 * DELETE /stations/:id
 */
export const deleteLineStation = catchAsync(async (req, res, next) => {
  await deleteLineStationService(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null
  });
});