import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";
import { TOKEN_COOKIE, getCookieOptions, clearCookieOptions } from "../config/cookie.js";

const createToken = (id, role = "customer") => {
  if (!process.env.JWT_SECRET) throw new Error("Missing JWT_SECRET environment variable");
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

const setAuthCookie = (res, token) => {
  res.cookie(TOKEN_COOKIE, token, getCookieOptions());
};

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw AppError.badRequest("All fields are required");
  }

  if (typeof name !== "string" || name.trim().length < 2 || name.length > 50) {
    throw AppError.badRequest("Name must be 2-50 characters");
  }

  const normalizedEmail = String(email).trim().toLowerCase();

  if (!validator.isEmail(normalizedEmail)) {
    throw AppError.badRequest("Please enter a valid email address");
  }

  if (password.length < 8) throw AppError.badRequest("Password must be at least 8 characters");
  if (password.length > 128) throw AppError.badRequest("Password is too long");

  const exist = await userModel.findOne({ email: normalizedEmail });
  if (exist) {
    throw new AppError("An account with this email already exists", { statusCode: 409, logLabel: "Duplicate" });
  }

  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = new userModel({
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
    role: "customer"
  });

  const user = await newUser.save();
  const token = createToken(user._id, user.role);
  setAuthCookie(res, token);

  res.status(201).json({
    success: true,
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role }
  });
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) throw AppError.badRequest("Email and password are required");

  const normalizedEmail = String(email).trim().toLowerCase();

  const user = await userModel.findOne({ email: normalizedEmail });
  if (!user) throw new AppError("Invalid email or password", { statusCode: 401, logLabel: "Login" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new AppError("Invalid email or password", { statusCode: 401, logLabel: "Login" });

  const token = createToken(user._id, user.role);
  setAuthCookie(res, token);

  res.status(200).json({
    success: true,
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role }
  });
});

const getUser = asyncHandler(async (req, res) => {
  const userId = req.userId || req.body?.userId;
  if (!userId) throw new AppError("Not authenticated", { statusCode: 401, logLabel: "Auth" });

  const user = await userModel.findById(userId).select("name email role");
  if (!user) throw AppError.notFound("User");

  const token = createToken(user._id, user.role);
  setAuthCookie(res, token);

  res.json({
    success: true,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
    token,
  });
});

const getFullProfile = asyncHandler(async (req, res) => {
  const userId = req.userId || req.body?.userId;
  if (!userId) throw new AppError("Not authenticated", { statusCode: 401, logLabel: "Auth" });

  const user = await userModel.findById(userId).select("-password");
  if (!user) throw AppError.notFound("User");

  const token = createToken(user._id, user.role);
  setAuthCookie(res, token);

  res.json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt,
    },
    token,
  });
});

const updateUserProfile = asyncHandler(async (req, res) => {
  const userId = req.userId || req.body?.userId;
  if (!userId) throw new AppError("Not authenticated", { statusCode: 401, logLabel: "Auth" });

  const { name, phone } = req.body;

  const updates = {};
  if (name !== undefined) {
    if (typeof name !== "string" || name.trim().length < 2 || name.length > 50) {
      throw AppError.badRequest("Name must be 2-50 characters");
    }
    updates.name = name.trim();
  }
  if (phone !== undefined) {
    if (phone && !/^\+?[\d\s\-()]{7,15}$/.test(phone)) {
      throw AppError.badRequest("Please enter a valid phone number");
    }
    updates.phone = phone;
  }

  if (Object.keys(updates).length === 0) {
    throw AppError.badRequest("No fields to update");
  }

  const user = await userModel
    .findByIdAndUpdate(userId, { $set: updates }, { new: true, runValidators: true })
    .select("-password");

  if (!user) throw AppError.notFound("User");

  const token = createToken(user._id, user.role);
  setAuthCookie(res, token);

  res.json({
    success: true,
    message: "Profile updated successfully",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt,
    },
    token,
  });
});

const logoutUser = asyncHandler(async (req, res) => {
  res.clearCookie(TOKEN_COOKIE, clearCookieOptions);
  res.json({ success: true, message: "Logged out successfully" });
});

export { registerUser, loginUser, logoutUser, getUser, getFullProfile, updateUserProfile };
