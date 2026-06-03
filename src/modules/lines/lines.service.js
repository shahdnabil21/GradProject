import { Line } from '../../DB/model/index.js';
import AppError from '../../utils/appError.js';

/**
 * GET ALL lines
 */
export const getAllLinesService = async () => {
  const lines = await Line.find();
  // console.log(lines);
  return lines;

  
};

/**
 * GET ONE line
 */
export const getLineService = async (id) => {
  const line = await Line.findById(id);

  if (!line) {
    throw new AppError('Line not found', 404);
  }

  return line;
};

/**
 * CREATE line
 */
export const createLineService = async (body) => {
  const line = await Line.create(body);
  return line;
};

/**
 * UPDATE line
 */
export const updateLineService = async (id, body) => {
  const line = await Line.findByIdAndUpdate(id, body, {
    new: true,
    runValidators: true
  });

  if (!line) {
    throw new AppError('Line not found', 404);
  }

  return line;
};

/**
 * DELETE STATION
 */
export const deleteLineService = async (id) => {
  const line = await Line.findByIdAndDelete(id);

  if (!line) {
    throw new AppError('Line not found', 404);
  }

  return line;
};