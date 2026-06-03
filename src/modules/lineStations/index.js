import { Router } from "express";
// import { isAuthenticated } from "../../middleware/authentication.middleware.js";
// import { isAdmin } from "../../middleware/admin.middleware.js";

// import { protect } from '../auth/auth.controller.js';
import {
  getAllLineStations,
  getLineStation,
  // addStationToLine,
  createLineStation,
  updateLineStation,
  deleteLineStation
} from "./lineStationController.js"

const router = Router();
// router.use(isAuthenticated);
// router.use(isAdmin);

router
  .route('/')
  .get( getAllLineStations)    
  .post( createLineStation);

router
  .route('/:id')
  .get( getLineStation)       
  .patch( updateLineStation)
  .delete( deleteLineStation);

// router.post('/:lineId/stations', addStationToLine);



export default router;
