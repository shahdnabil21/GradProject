
import { Router } from "express";
import { isAuthenticated } from "../../middleware/authentication.middleware.js";
// import { protect } from '../auth/auth.controller.js';
import {
  getUser,
  createUser,
  updateUser,
  deleteUser,
  deactivateAccount,
} from './user.controller.js';

const router = Router();

//Protect all routes
router.use(isAuthenticated);

// ⭐ deactivate route
router.delete('/deactivate', deactivateAccount);

// ✅ create update get routes
router.route('/').post( createUser);
router.route('/:id').get( getUser).patch( updateUser).delete(deleteUser);



export default router;