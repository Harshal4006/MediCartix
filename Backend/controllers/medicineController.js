import medicineModel from "../models/MedicineModel.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { logger } from "../config/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CATEGORIES = [
  "Prescription Medicines", "OTC Medicines", "Health & Wellness",
  "First Aid", "Medical Devices", "Personal Care", "Baby Care", "Ayurvedic & Herbal"
];

const addMedicine = async (req, res) => {
  try {
    const { name, description, price, category } = req.body;

    if (!name || !description || !price || !category) {
      if (req.file) {
        fs.unlink(req.file.path, () => {});
      }
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    if (typeof name !== "string" || name.trim().length < 2 || name.length > 100) {
      fs.unlink(req.file.path, () => {});
      return res.status(400).json({ success: false, message: "Name must be 2-100 characters" });
    }

    const parsedPrice = Number(price);
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0 || parsedPrice > 100000) {
      fs.unlink(req.file.path, () => {});
      return res.status(400).json({ success: false, message: "Price must be between 1 and 100000" });
    }

    if (!CATEGORIES.includes(category)) {
      fs.unlink(req.file.path, () => {});
      return res.status(400).json({ success: false, message: "Invalid category" });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Medicine image is required" });
    }

    const medicine = new medicineModel({
      name: name.trim(),
      description: description.trim(),
      price: parsedPrice,
      category,
      image: req.file.filename
    });

    await medicine.save();
    res.status(201).json({ success: true, message: "Medicine Added", data: medicine });
  } catch (error) {
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }
    logger.error("Add medicine error:", error);
    res.status(500).json({ success: false, message: "Error adding medicine" });
  }
};

const listMedicine = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [medicines, total] = await Promise.all([
      medicineModel.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit),
      medicineModel.countDocuments({})
    ]);

    res.json({
      success: true,
      data: medicines,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasMore: skip + medicines.length < total
      }
    });
  } catch (error) {
    logger.error("List medicine error:", error);
    res.status(500).json({ success: false, message: "Error fetching medicines" });
  }
};

const removeMedicine = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: "Medicine ID is required" });
    }

    const medicine = await medicineModel.findById(id);

    if (!medicine) {
      return res.status(404).json({ success: false, message: "Medicine not found" });
    }

    const imagePath = path.join(__dirname, "..", "uploads", medicine.image);
    fs.unlink(imagePath, (err) => {
      if (err && err.code !== "ENOENT") {
        logger.error("Error deleting image file:", err);
      }
    });

    await medicineModel.findByIdAndDelete(id);

    res.json({ success: true, message: "Medicine Removed" });
  } catch (error) {
    logger.error("Remove medicine error:", error);
    res.status(500).json({ success: false, message: "Error removing medicine" });
  }
};

const searchMedicine = async (req, res) => {
  try {
    const query = (req.query.q || "").trim();

    if (!query) {
      return res.json({ success: true, data: [] });
    }

    if (query.length > 100) {
      return res.status(400).json({ success: false, message: "Search query too long" });
    }

    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [medicines, total] = await Promise.all([
      medicineModel.find({
        name: { $regex: escapedQuery, $options: "i" }
      }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      medicineModel.countDocuments({
        name: { $regex: escapedQuery, $options: "i" }
      })
    ]);

    res.json({
      success: true,
      data: medicines,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasMore: skip + medicines.length < total
      }
    });
  } catch (error) {
    logger.error("Search medicine error:", error);
    res.status(500).json({ success: false, message: "Search failed" });
  }
};

export { addMedicine, listMedicine, removeMedicine, searchMedicine };
