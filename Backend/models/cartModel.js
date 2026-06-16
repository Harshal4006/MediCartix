import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  medicineId: { type: mongoose.Schema.Types.ObjectId, ref: "medicine", required: true },
  quantity: { type: Number, required: true, min: 1, default: 1 },
});

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true, unique: true, index: true },
  items: [cartItemSchema],
}, { timestamps: true });

cartSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

const cartModel = mongoose.models.cart || mongoose.model("cart", cartSchema);

export default cartModel;
