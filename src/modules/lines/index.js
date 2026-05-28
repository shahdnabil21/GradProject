import { Router } from "express";
import { addStationToLine } from '../lineStations/lineStationController.js';
// import { protect } from '../auth/auth.controller.js';
import { isAuthenticated } from "../../middleware/authentication.middleware.js";

import {
  getAllLines,
  getLine,
  createLine,
  updateLine,
  deleteLine
} from "./line.controllers.js"

const router = Router();
router.use(isAuthenticated);

router
  .route('/')
  .get(  getAllLines)    
  .post(createLine);

router
  .route('/:id')
  .get( getLine)       
  .patch( updateLine)
  .delete( deleteLine);

router.post('/:lineId/stations',  addStationToLine);



export default router;
