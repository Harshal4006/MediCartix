import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  medicineId: { type: String },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true }
}, { _id: false });

const addressSchema = new mongoose.Schema({
  firstName: { type: String },
  lastName: { type: String },
  email: { type: String },
  street: { type: String },
  city: { type: String },
  state: { type: String },
  zipcode: { type: String },
  country: { type: String },
  phone: { type: String }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true, index: true },
  items: { type: [orderItemSchema], required: true },
  amount: { type: Number, required: true },
  address: { type: addressSchema, required: true },
  paymentMethod: { type: String, enum: ["COD", "Razorpay", "Stripe"], default: "COD" },
  paymentId: { type: String, default: "" },
  status: { type: String, default: "Medicine Processing", index: true },
  date: { type: Date, default: Date.now },
  payment: { type: Boolean, default: false }
});

orderSchema.index({ userId: 1, date: -1 });
orderSchema.index({ status: 1, date: -1 });

const orderModel = mongoose.models.order || mongoose.model("order", orderSchema);

export default orderModel;
