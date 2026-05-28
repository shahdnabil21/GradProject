import { Router } from 'express';
import { isAuthenticated } from "../../middleware/authentication.middleware.js";

// import { protect } from '../auth/auth.controller.js';
import { getRoutePreview } from './mapControler.js';

const router = Router();
router.use(isAuthenticated);

router.get('/preview', getRoutePreview);

export default router;
