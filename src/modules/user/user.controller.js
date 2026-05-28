import catchAsync from '../../utils/catchAsync.js';
import {
  deactivateAccountService,
  getUserService,
  createUserService,
  updateUserService,
  deleteUserService,
} from './user.service.js';

// ✅controllers — not defined yet (placeholders)
export const getUser = catchAsync(async (req, res, next) => {
  await getUserService(req.params.id);
});

export const createUser = catchAsync(async (req, res, next) => {
  await createUserService(req.body);
});

export const updateUser = catchAsync(async (req, res, next) => {
  await updateUserService(req.params.id, req.body);
});

export const deleteUser = catchAsync(async (req, res, next) => {
  await deleteUserService(req.params.id);
});


// ⭐deactivate my account PART
export const deactivateAccount = catchAsync(async (req, res, next) => {
  await deactivateAccountService(req.user.id);

  res.status(204).json({
    status: 'success',
    data: null
  });
});