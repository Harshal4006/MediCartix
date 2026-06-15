import prescriptionModel from "../models/prescriptionModel.js";
import { logger } from "../config/logger.js";

const uploadPrescription = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Please upload a prescription file" });
    }

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
  } catch (error) {
    logger.error("Upload prescription error:", error);
    res.status(500).json({ success: false, message: "Error uploading prescription" });
  }
};

const getUserPrescriptions = async (req, res) => {
  try {
    const prescriptions = await prescriptionModel
      .find({ userId: req.body.userId })
      .sort({ createdAt: -1 });

    res.json({ success: true, data: prescriptions });
  } catch (error) {
    logger.error("Get prescriptions error:", error);
    res.status(500).json({ success: false, message: "Error fetching prescriptions" });
  }
};

const listPrescriptions = async (req, res) => {
  try {
    const status = req.query.status;
    const filter = {};
    if (status) filter.status = status;

    const prescriptions = await prescriptionModel
      .find(filter)
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: prescriptions });
  } catch (error) {
    logger.error("List prescriptions error:", error);
    res.status(500).json({ success: false, message: "Error fetching prescriptions" });
  }
};

const updatePrescriptionStatus = async (req, res) => {
  try {
    const { id, status, adminNote } = req.body;

    const validStatuses = ["pending", "approved", "rejected", "fulfilled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const prescription = await prescriptionModel.findByIdAndUpdate(
      id,
      { status, adminNote: adminNote || "", reviewedAt: new Date() },
      { new: true }
    );

    if (!prescription) {
      return res.status(404).json({ success: false, message: "Prescription not found" });
    }

    res.json({ success: true, message: `Prescription ${status}`, data: prescription });
  } catch (error) {
    logger.error("Update prescription status error:", error);
    res.status(500).json({ success: false, message: "Error updating prescription" });
  }
};

export { uploadPrescription, getUserPrescriptions, listPrescriptions, updatePrescriptionStatus };
