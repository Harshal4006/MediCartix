import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";
import { ADMIN_TOKEN_COOKIE, getCookieOptions, clearCookieOptions } from "../config/cookie.js";
import authMiddleware from "../middleware/auth.js";
import adminMiddleware from "../middleware/admin.js";

const adminRouter = express.Router();

adminRouter.post("/login", asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) throw AppError.badRequest("Email and password are required");

  const normalizedEmail = String(email).trim().toLowerCase();
  const user = await userModel.findOne({ email: normalizedEmail, role: "admin" });

  if (!user) throw new AppError("Invalid admin credentials", { statusCode: 401, logLabel: "Admin login" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new AppError("Invalid admin credentials", { statusCode: 401, logLabel: "Admin login" });

  if (!process.env.JWT_SECRET) {
    throw new AppError("Server configuration error", { statusCode: 500, logLabel: "JWT" });
  }

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.cookie(ADMIN_TOKEN_COOKIE, token, getCookieOptions());

  res.json({
    success: true,
    token,
    admin: { name: user.name, email: user.email }
  });
}));

adminRouter.post("/seed", asyncHandler(async (req, res) => {
  const { email, password, name, secretKey } = req.body;

  if (secretKey !== process.env.ADMIN_SECRET_KEY) {
    throw new AppError("Invalid secret key", { statusCode: 403, logLabel: "Admin seed" });
  }

  if (!email || !password || !name) {
    throw AppError.badRequest("Email, password, and name are required");
  }

  const existing = await userModel.findOne({ email: String(email).trim().toLowerCase() });
  if (existing) {
    existing.role = "admin";
    await existing.save();
    return res.json({ success: true, message: "Existing user promoted to admin" });
  }

  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);

  const admin = new userModel({
    name: name.trim(),
    email: String(email).trim().toLowerCase(),
    password: hashedPassword,
    role: "admin"
  });

  await admin.save();
  res.status(201).json({ success: true, message: "Admin created successfully" });
}));

adminRouter.post("/logout", authMiddleware, adminMiddleware, asyncHandler(async (req, res) => {
  res.clearCookie(ADMIN_TOKEN_COOKIE, clearCookieOptions);
  res.json({ success: true, message: "Logged out successfully" });
}));

export default adminRouter;
