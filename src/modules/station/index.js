import { Router } from "express";
// import { isAuthenticated } from "../../middleware/authentication.middleware.js";
// import { isAdmin }          from "../../middleware/admin.middleware.js";

// import { protect } from '../auth/auth.controller.js';
import {
  getAllStations,
  getStation,
  createStation,
  updateStation,
  deleteStation
} from "./stationControllers.js"

const router = Router();

// router.use(isAuthenticated);
// router.use(isAdmin);

router
  .route('/')
  .get( getAllStations)    
  .post(createStation);

router
  .route('/:id')
  .get(getStation)       
  .patch(updateStation)
  .delete(deleteStation);

export default router;
