import path from "path";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";
import prescriptionModel from "../models/prescriptionModel.js";
import userModel from "../models/userModel.js";
import { logger } from "../config/logger.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VALID_STATUSES = ["pending", "approved", "rejected", "fulfilled"];

const uploadPrescription = asyncHandler(async (req, res) => {
  if (!req.file) throw AppError.badRequest("Please upload a prescription file");

  const prescription = new prescriptionModel({
    userId: req.body.userId,
    fileName: req.file.filename,
    originalName: req.file.originalname,
    fileSize: req.file.size,
    mimeType: req.file.mimetype,
    status: "pending"
  });

  await prescription.save();

  res.status(201).json({
    success: true,
    message: "Prescription uploaded successfully",
    data: { id: prescription._id, status: prescription.status }
  });
});

const getUserPrescriptions = asyncHandler(async (req, res) => {
  const prescriptions = await prescriptionModel
    .find({ userId: req.body.userId })
    .sort({ createdAt: -1 });

  res.json({ success: true, data: prescriptions });
});

const listPrescriptions = asyncHandler(async (req, res) => {
  const status = req.query.status;
  const filter = {};
  if (status) filter.status = status;

  const prescriptions = await prescriptionModel
    .find(filter)
    .populate("userId", "name email")
    .sort({ createdAt: -1 });

  res.json({ success: true, data: prescriptions });
});

const updatePrescriptionStatus = asyncHandler(async (req, res) => {
  const { id, status, adminNote } = req.body;

  if (!VALID_STATUSES.includes(status)) throw AppError.badRequest("Invalid status");

  const prescription = await prescriptionModel.findByIdAndUpdate(
    id,
    { status, adminNote: adminNote || "", reviewedAt: new Date() },
    { new: true }
  );

  if (!prescription) throw AppError.notFound("Prescription");

  res.json({ success: true, message: `Prescription ${status}`, data: prescription });
});

const getPrescriptionFile = asyncHandler(async (req, res) => {
  const { id } = req.params;

  let userId = req.userId || req.body?.userId;

  if (!userId && req.query.token) {
    try {
      const decoded = jwt.verify(req.query.token, process.env.JWT_SECRET);
      userId = decoded.id;
    } catch {
      throw new AppError("Invalid token", { statusCode: 401, logLabel: "Auth" });
    }
  }

  if (!id || !userId) throw AppError.badRequest("Prescription ID is required");

  const user = await userModel.findById(userId).select("role");
  if (!user) throw new AppError("User not found", { statusCode: 401, logLabel: "Auth" });

  const prescription = await prescriptionModel.findById(id).select("userId fileName mimeType");
  if (!prescription) throw AppError.notFound("Prescription");

  const isOwner = String(prescription.userId) === String(userId);
  const isAdmin = user.role === "admin";
  if (!isOwner && !isAdmin) throw AppError.forbidden();

  const filePath = path.join(__dirname, "..", "uploads", "prescriptions", prescription.fileName);

  res.sendFile(filePath, (err) => {
    if (err) {
      logger.error("Error sending prescription file:", err);
      res.status(404).json({ success: false, message: "File not found" });
    }
  });
});

export { uploadPrescription, getUserPrescriptions, listPrescriptions, updatePrescriptionStatus, getPrescriptionFile };
