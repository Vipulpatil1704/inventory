import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { verifyAccessToken } from '../utils/jwt.js';

const authenticate = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    throw new AppError('Authentication required', 401);
  }

  const token = header.split(' ')[1];
  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch {
    throw new AppError('Invalid or expired access token', 401);
  }

  const user = await User.findById(decoded.sub);
  if (!user) {
    throw new AppError('User no longer exists', 401);
  }

  req.user = user;
  next();
});

const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    return next();
  };

export { authenticate, authorize };
