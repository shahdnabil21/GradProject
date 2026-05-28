import { User } from '../../DB/model/index.js'
import AppError from '../../utils/appError.js';

export const getUserService = async (id) => {
  throw new AppError('This route is not yet defined!', 500);
};

export const createUserService = async (body) => {
  throw new AppError('This route is not yet defined!', 500);
};

export const updateUserService = async (id, body) => {
  throw new AppError('This route is not yet defined!', 500);
};

export const deleteUserService = async (id) => {
  throw new AppError('This route is not yet defined!', 500);
};

export const deactivateAccountService = async (userId) => {
  await User.findByIdAndUpdate(userId, { active: false });
};