import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import { logger } from "../config/logger.js";

const adminRouter = express.Router();

adminRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const user = await userModel.findOne({ email: normalizedEmail, role: "admin" });

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid admin credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid admin credentials" });
    }

    if (!process.env.JWT_SECRET) {
      logger.error("JWT_SECRET not configured");
      return res.status(500).json({ success: false, message: "Server configuration error" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      success: true,
      token,
      admin: {
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    logger.error("Admin login error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

adminRouter.post("/seed", async (req, res) => {
  try {
    const { email, password, name, secretKey } = req.body;

    if (secretKey !== process.env.ADMIN_SECRET_KEY) {
      return res.status(403).json({ success: false, message: "Invalid secret key" });
    }

    if (!email || !password || !name) {
      return res.status(400).json({ success: false, message: "Email, password, and name are required" });
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
  } catch (error) {
    logger.error("Admin seed error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

export default adminRouter;
