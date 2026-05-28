import catchAsync from '../../utils/catchAsync.js';
import {
  getAllLinesService,
  getLineService,
  createLineService,
  updateLineService,
  deleteLineService
} from './lines.service.js';

/**
 * GET ALL LINES
 * GET /lines
 */
export const getAllLines = catchAsync(async (req, res, next) => {
  const lines = await getAllLinesService();

  res.status(200).json({
    status: 'success',
    results: lines.length,
    data: lines
  });
});

/**
 * GET ONE LINE
 * GET /lines/:id
 */
export const getLine = catchAsync(async (req, res, next) => {
  const line = await getLineService(req.params.id);

  res.status(200).json({
    status: 'success',
    data: line
  });
});

/**
 * CREATE LINE
 * POST /lines
 */
export const createLine = catchAsync(async (req, res, next) => {
  const line = await createLineService(req.body);

  res.status(201).json({
    status: 'success',
    data: line
  });
});

/**
 * UPDATE LINE
 * PATCH /lines/:id
 */
export const updateLine = catchAsync(async (req, res, next) => {
  const line = await updateLineService(req.params.id, req.body);

  res.status(200).json({
    status: 'success',
    data: line
  });
});

/**
 * DELETE LINE
 * DELETE /lines/:id
 */
export const deleteLine = catchAsync(async (req, res, next) => {
  await deleteLineService(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null
  });
});