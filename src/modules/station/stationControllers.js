import catchAsync from '../../utils/catchAsync.js';
import {
  getAllStationsService,
  getStationService,
  createStationService,
  updateStationService,
  deleteStationService
} from './station.service.js';

/**
 * GET ALL STATIONS
 * GET /stations
 */
export const getAllStations = catchAsync(async (req, res, next) => {
  const stations = await getAllStationsService();

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
export const getStation = catchAsync(async (req, res, next) => {
  const station = await getStationService(req.params.id);

  res.status(200).json({
    status: 'success',
    data: station
  });
});

/**
 * CREATE STATION
 * POST /stations
 */
export const createStation = catchAsync(async (req, res, next) => {
  const station = await createStationService(req.body);

  res.status(201).json({
    status: 'success',
    data: station
  });
});

/**
 * UPDATE STATION
 * PATCH /stations/:id
 */
export const updateStation = catchAsync(async (req, res, next) => {
  const station = await updateStationService(req.params.id, req.body);

  res.status(200).json({
    status: 'success',
    data: station
  });
});

/**
 * DELETE STATION
 * DELETE /stations/:id
 */
export const deleteStation = catchAsync(async (req, res, next) => {
  await deleteStationService(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null
  });
});