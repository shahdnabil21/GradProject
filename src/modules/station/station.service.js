import { Station } from '../../DB/model/index.js';
import AppError from '../../utils/appError.js';

/**
 * GET ALL STATIONS
 */
export const getAllStationsService = async () => {
  const stations = await Station.find();
  return stations;

  
};

/**
 * GET ONE STATION
 */
export const getStationService = async (id) => {
  const station = await Station.findById(id);

  if (!station) {
    throw new AppError('Station not found', 404);
  }

  return station;
};

/**
 * CREATE STATION
 */
export const createStationService = async (body) => {
  const station = await Station.create(body);
  return station;
};

/**
 * UPDATE STATION
 */
export const updateStationService = async (id, body) => {
  const station = await Station.findByIdAndUpdate(id, body, {
    new: true,
    runValidators: true
  });

  if (!station) {
    throw new AppError('Station not found', 404);
  }

  return station;
};

/**
 * DELETE STATION
 */
export const deleteStationService = async (id) => {
  const station = await Station.findByIdAndDelete(id);

  if (!station) {
    throw new AppError('Station not found', 404);
  }

  return station;
};