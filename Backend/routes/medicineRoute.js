import express from "express";
import { addMedicine, listMedicine, removeMedicine, searchMedicine } from "../controllers/medicineController.js";
import authMiddleware from "../middleware/auth.js";
import adminMiddleware from "../middleware/admin.js";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const medicineRouter = express.Router();

const storage = multer.diskStorage({
  destination: path.join(__dirname, "..", "uploads"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = file.originalname.replace(ext, "").replace(/[^a-zA-Z0-9]/g, "_").substring(0, 30);
    cb(null, `${Date.now()}-${name}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, WebP, and GIF images are allowed"), false);
    }
  }
});

medicineRouter.post("/add", authMiddleware, adminMiddleware, upload.single("image"), addMedicine);
medicineRouter.get("/list", listMedicine);
medicineRouter.post("/remove", authMiddleware, adminMiddleware, removeMedicine);
medicineRouter.get("/search", searchMedicine);

export default medicineRouter;
