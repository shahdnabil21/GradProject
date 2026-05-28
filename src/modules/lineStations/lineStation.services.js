import {LineStation, Station} from '../../DB/model/index.js';
import AppError from '../../utils/appError.js';
import { Types } from 'mongoose';

/**
 * GET ALL STATIONS
 */
// export const getAllLineStationsService = async () => {
//   const lineStations = await LineStation.find(); // model = LineStation
//   console.log(lineStations);
//   return lineStations;
// };
export const getAllLineStationsService = async () => {
  const lineStations = await LineStation.aggregate([
    // Join Station
    {
      $lookup: {
        from: 'stations',
        localField: 'station',
        foreignField: '_id',
        as: 'station'
      }
    },
    { $unwind: '$station' },

    // Join Line
    {
      $lookup: {
        from: 'lines',
        localField: 'line',
        foreignField: '_id',
        as: 'line'
      }
    },
    { $unwind: '$line' },

    // Group by line
    {
      $group: {
        _id: '$line._id',
        lineName: { $first: '$line.name' },
        lineNameAr: { $first: '$line.nameAr' },
        lineNumber: { $first: '$line.lineNumber' },
        stations: {
          $push: {

            stationId: '$station._id',
            stationName: '$station.name',
            stationNameAr: '$station.nameAr',
            order: '$order',
            branch: '$branch'
          }
        }
      }
    },

    // Sort stations inside each line by order
    {
      $addFields: {
        stations: { $sortArray: { input: '$stations', sortBy: { order: 1 } } }
      }
    },

    {
      $project: {
        _id: 0,
        lineId: '$_id',
        lineName: 1,
        lineNameAr: 1,
        lineNumber: 1,
        stations: 1
      }
    },

    // Sort lines by lineNumber
    { $sort: { lineNumber: 1 } }
  ]);

  return lineStations;
};

/**
 * GET ONE STATION
 */



export const getLineStationService = async (id) => {
  const lineStations = await LineStation.aggregate([
    // Filter by station id first
    {
      $match: {
        station: new Types.ObjectId(id) 
      }
    },

    // Join Station
    {
      $lookup: {
        from: 'stations',
        localField: 'station',
        foreignField: '_id',
        as: 'station'
      }
    },
    { $unwind: '$station' },

    // Join Line
    {
      $lookup: {
        from: 'lines',
        localField: 'line',
        foreignField: '_id',
        as: 'line'
      }
    },
    { $unwind: '$line' },

    // Group by station
    {
      $group: {
        _id: '$station._id',
        stationName: { $first: '$station.name' },
        stationNameAr: { $first: '$station.nameAr' },
        lines: {
          $push: {
            lineStationId: '$_id',
            lineName: '$line.name',
            lineNameAr: '$line.nameAr',
            lineNumber: '$line.lineNumber',
            order: '$order',
            branch: '$branch'
          }
        }
      }
    },

    {
      $project: {
        _id: 0,
        stationId: '$_id',
        stationName: 1,
        stationNameAr: 1,
        lines: 1
      }
    }
  ]);

  if (!lineStations.length) {
    throw new AppError('Station not found', 404);
  }

  return lineStations[0]; 
};
/**
 * CREATE STATION
 */
export const addStationToLineService = async (lineId, body) => {
  const { name, nameAr, order, branch } = body;


  const newStation = await Station.create({ name, nameAr });

 
  const lineStation = await LineStation.create({
    station: newStation._id,
    line: lineId,
    order,
    branch: branch || null
  });

  return {
    stationId: newStation._id,
    name: newStation.name,
    nameAr: newStation.nameAr,
    lineStationId: lineStation._id,
    order: lineStation.order,
    branch: lineStation.branch
  };
};

export const createLineStationService = async (body) => {
  const lineStation = await LineStation.create(body);
  return lineStation;
};

/**
 * UPDATE STATION
 */
export const updateLineStationService = async (id, body) => {
  const lineStation = await LineStation.findByIdAndUpdate(id, body, {
    new: true,
    runValidators: true
  });

  if (!lineStation) {
    throw new AppError('Line station not found', 404);
  }

  return lineStation;
};

/**
 * DELETE STATION
 */
export const deleteLineStationService = async (id) => {
  const lineStation = await LineStation.findByIdAndDelete(id);

  if (!lineStation) {
    throw new AppError('Line station not found', 404);
  }

  return lineStation;
};