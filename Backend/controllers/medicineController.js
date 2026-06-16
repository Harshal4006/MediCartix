import medicineModel from "../models/MedicineModel.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { logger } from "../config/logger.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";
import { parsePagination, paginationMeta } from "../utils/paginate.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CATEGORIES = [
  "Prescription Medicines", "OTC Medicines", "Health & Wellness",
  "First Aid", "Medical Devices", "Personal Care", "Baby Care", "Ayurvedic & Herbal"
];

const addMedicine = asyncHandler(async (req, res) => {
  const { name, description, price, category, form, packSize, manufacturer, countryOfOrigin, prescriptionRequired, expiryMonths } = req.body;

  if (!name || !description || !price || !category) {
    if (req.file) fs.unlink(req.file.path, () => {});
    throw AppError.badRequest("All fields are required");
  }

  if (typeof name !== "string" || name.trim().length < 2 || name.length > 100) {
    if (req.file) fs.unlink(req.file.path, () => {});
    throw AppError.badRequest("Name must be 2-100 characters");
  }

  const parsedPrice = Number(price);
  if (!Number.isFinite(parsedPrice) || parsedPrice <= 0 || parsedPrice > 100000) {
    if (req.file) fs.unlink(req.file.path, () => {});
    throw AppError.badRequest("Price must be between 1 and 100000");
  }

  if (!CATEGORIES.includes(category)) {
    if (req.file) fs.unlink(req.file.path, () => {});
    throw AppError.badRequest("Invalid category");
  }

  if (!req.file) throw AppError.badRequest("Medicine image is required");

  const medicine = new medicineModel({
    name: name.trim(),
    description: description.trim(),
    price: parsedPrice,
    category,
    image: req.file.filename,
    form: form || undefined,
    packSize: packSize || undefined,
    manufacturer: manufacturer || undefined,
    countryOfOrigin: countryOfOrigin || undefined,
    prescriptionRequired: prescriptionRequired === "true" || prescriptionRequired === true,
    expiryMonths: expiryMonths ? Number(expiryMonths) : undefined
  });

  await medicine.save();
  res.status(201).json({ success: true, message: "Medicine Added", data: medicine });
});

const listMedicine = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);

  const [medicines, total] = await Promise.all([
    medicineModel.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    medicineModel.countDocuments({})
  ]);

  res.json({
    success: true,
    data: medicines,
    pagination: paginationMeta(page, limit, skip, total, medicines.length)
  });
});

const removeMedicine = asyncHandler(async (req, res) => {
  const { id } = req.body;
  if (!id) throw AppError.missingField("Medicine ID");

  const medicine = await medicineModel.findById(id);
  if (!medicine) throw AppError.notFound("Medicine");

  const imagePath = path.join(__dirname, "..", "uploads", "medicines", medicine.image);
  fs.unlink(imagePath, (err) => {
    if (err && err.code !== "ENOENT") {
      logger.error("Error deleting image file:", err);
    }
  });

  await medicineModel.findByIdAndDelete(id);
  res.json({ success: true, message: "Medicine Removed" });
});

const searchMedicine = asyncHandler(async (req, res) => {
  const query = (req.query.q || "").trim();

  if (!query) return res.json({ success: true, data: [] });
  if (query.length > 100) throw AppError.badRequest("Search query too long");

  const { page, limit, skip } = parsePagination(req.query);

  let medicines, total;

  if (query.length >= 3) {
    const textFilter = { $text: { $search: query } };
    [medicines, total] = await Promise.all([
      medicineModel.find(textFilter)
        .sort({ score: { $meta: "textScore" } })
        .skip(skip).limit(limit).lean(),
      medicineModel.countDocuments(textFilter)
    ]);
  }

  if (!medicines || medicines.length === 0) {
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regexTerms = escapedQuery.split(/\s+/).filter(Boolean);
    const regexFilter = {
      name: { $regex: regexTerms.join("|"), $options: "i" }
    };
    [medicines, total] = await Promise.all([
      medicineModel.find(regexFilter)
        .sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      medicineModel.countDocuments(regexFilter)
    ]);
  }

  res.json({
    success: true,
    data: medicines,
    pagination: paginationMeta(page, limit, skip, total, medicines.length)
  });
});

export { addMedicine, listMedicine, removeMedicine, searchMedicine };
