import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import authMiddleware from "../middleware/auth.js";
import adminMiddleware from "../middleware/admin.js";
import {
  uploadPrescription,
  getUserPrescriptions,
  listPrescriptions,
  updatePrescriptionStatus
} from "../controllers/prescriptionController.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: path.join(__dirname, "..", "uploads", "prescriptions"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = file.originalname.replace(ext, "").replace(/[^a-zA-Z0-9]/g, "_").substring(0, 30);
    cb(null, `${Date.now()}-${name}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, WebP, and PDF files are allowed"), false);
    }
  }
});

const prescriptionRouter = express.Router();

prescriptionRouter.post("/upload", authMiddleware, upload.single("prescription"), uploadPrescription);
prescriptionRouter.get("/mine", authMiddleware, getUserPrescriptions);
prescriptionRouter.get("/list", authMiddleware, adminMiddleware, listPrescriptions);
prescriptionRouter.post("/status", authMiddleware, adminMiddleware, updatePrescriptionStatus);

export default prescriptionRouter;
