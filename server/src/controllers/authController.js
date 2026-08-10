import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt.js';

function issueTokens(user) {
  const payload = { sub: user._id.toString(), role: user.role, email: user.email };
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  };
}

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError('Email already registered', 409);
  }

  const userCount = await User.countDocuments();
  const role = userCount === 0 ? 'admin' : 'staff';

  const user = await User.create({ name, email, password, role });
  const tokens = issueTokens(user);

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: {
      user: user.toSafeObject(),
      ...tokens,
    },
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }

  const tokens = issueTokens(user);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: user.toSafeObject(),
      ...tokens,
    },
  });
});

const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError('Invalid or expired refresh token', 401);
  }

  const user = await User.findById(decoded.sub);
  if (!user) {
    throw new AppError('User no longer exists', 401);
  }

  const tokens = issueTokens(user);

  res.status(200).json({
    success: true,
    message: 'Token refreshed',
    data: {
      user: user.toSafeObject(),
      ...tokens,
    },
  });
});

const logout = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

const me = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: { user: req.user.toSafeObject() },
  });
});

export default {
  register,
  login,
  refresh,
  logout,
  me,
};
