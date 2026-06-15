import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true, index: true },
  fileName: { type: String, required: true },
  originalName: { type: String, required: true },
  fileSize: { type: Number, required: true },
  mimeType: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "fulfilled"],
    default: "pending"
  },
  adminNote: { type: String, default: "" },
  reviewedAt: { type: Date }
}, { timestamps: true });

prescriptionSchema.index({ userId: 1, status: 1 });
prescriptionSchema.index({ status: 1, createdAt: -1 });

const prescriptionModel = mongoose.models.prescription ||
  mongoose.model("prescription", prescriptionSchema);

export default prescriptionModel;
