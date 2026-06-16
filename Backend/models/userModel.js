import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: { type: String, required: true },
    phone: { type: String, default: "" },
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
  },
  { minimize: false, timestamps: true }
);

userSchema.index({ role: 1 });

const userModel =
  mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;
