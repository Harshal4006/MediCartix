import mongoose from "mongoose";
import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import cartModel from "../models/cartModel.js";
import medicineModel from "../models/MedicineModel.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";
import { parsePagination, paginationMeta } from "../utils/paginate.js";

const DELIVERY_FEE = 40;
const FREE_DELIVERY_THRESHOLD = 299;

const VALID_METHODS = ["COD", "Razorpay", "Stripe"];
const VALID_STATUSES = ["Medicine Processing", "Out for delivery", "Delivered", "Cancelled"];
const VALID_STATUSES_FILTER = [...VALID_STATUSES, "Payment Failed"];

const placeOrder = asyncHandler(async (req, res) => {
  const { userId, address, paymentMethod } = req.body;

  if (!address) {
    throw AppError.badRequest("Invalid order data");
  }

  const method = paymentMethod || "COD";
  if (!VALID_METHODS.includes(method)) throw AppError.badRequest("Invalid payment method");

  const user = await userModel.findById(userId).select("_id");
  if (!user) throw AppError.notFound("User");

  const cart = await cartModel.findOne({ userId }).lean();
  if (!cart || !cart.items || cart.items.length === 0) {
    throw AppError.badRequest("Cart is empty");
  }

  const itemIds = cart.items.map((item) => item.medicineId);
  const medicines = await medicineModel.find({ _id: { $in: itemIds } }).lean();
  if (medicines.length !== cart.items.length) {
    throw AppError.badRequest("One or more medicines not found");
  }

  const medicineMap = Object.fromEntries(medicines.map((m) => [String(m._id), m]));

  let subtotal = 0;
  const orderItems = cart.items.map((item) => {
    const id = String(item.medicineId);
    const medicine = medicineMap[id];
    if (!medicine) throw AppError.badRequest(`Medicine ${id} not found`);

    const quantity = Math.max(1, Number(item.quantity) || 1);
    const price = medicine.price;
    subtotal += price * quantity;

    return {
      medicineId: id,
      name: medicine.name,
      quantity,
      price,
    };
  });

  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const total = subtotal + deliveryFee;

  const now = new Date();
  const newOrder = new orderModel({
    userId,
    items: orderItems,
    amount: total,
    subtotal,
    deliveryFee,
    address,
    paymentMethod: method,
    payment: false,
    statusHistory: [{ status: "Order Placed", timestamp: now }, { status: "Medicine Processing", timestamp: now }]
  });

  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    await newOrder.save({ session });
    await cartModel.findOneAndDelete({ userId }, { session });
    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }

  res.status(201).json({
    success: true,
    orderId: newOrder._id,
    amount: total,
    message: "Order Created"
  });
});

const verifyOrder = asyncHandler(async (req, res) => {
  const { orderId, success } = req.body;

  if (!orderId) throw AppError.missingField("Order ID");

  const order = await orderModel.findById(orderId).select("userId payment paymentMethod");
  if (!order) throw AppError.notFound("Order");

  if (String(order.userId) !== String(req.userId || req.body?.userId)) throw AppError.forbidden();

  if (order.paymentMethod !== "COD") throw AppError.badRequest("Use /api/payment/verify for online payments");

  if (order.payment) throw AppError.badRequest("Order already verified");

  if (success) {
    await orderModel.findByIdAndUpdate(orderId, { payment: true });

    return res.json({ success: true, message: "Order confirmed" });
  }

  await orderModel.findByIdAndUpdate(orderId, {
    payment: false,
    status: "Payment Failed",
    $push: { statusHistory: { status: "Payment Failed", timestamp: new Date() } }
  });
  res.json({ success: false, message: "Order cancelled" });
});

const userOrders = asyncHandler(async (req, res) => {
  const userId = req.userId || req.body?.userId;
  const { page, limit, skip } = parsePagination(req.query, { limit: 10, maxLimit: 20 });

  const [orders, total] = await Promise.all([
    orderModel.find({ userId }).sort({ date: -1 }).skip(skip).limit(limit).lean(),
    orderModel.countDocuments({ userId })
  ]);

  res.json({
    success: true,
    data: orders,
    pagination: paginationMeta(page, limit, skip, total, orders.length)
  });
});

const listOrders = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const status = req.query.status;

  const filter = {};
  if (status && VALID_STATUSES_FILTER.includes(status)) {
    filter.status = status;
  }

  const [orders, total] = await Promise.all([
    orderModel.find(filter).sort({ date: -1 }).skip(skip).limit(limit).lean(),
    orderModel.countDocuments(filter)
  ]);

  const userIds = [...new Set(orders.map((o) => o.userId))];
  const users = await userModel.find({ _id: { $in: userIds } }).select("name email").lean();
  const userMap = Object.fromEntries(users.map((u) => [String(u._id), u]));

  const enrichedOrders = orders.map((order) => ({
    ...order,
    user: userMap[String(order.userId)] || null
  }));

  res.json({
    success: true,
    data: enrichedOrders,
    pagination: paginationMeta(page, limit, skip, total, orders.length)
  });
});

const updateStatus = asyncHandler(async (req, res) => {
  const { orderId, status } = req.body;

  if (!orderId || !status) throw AppError.badRequest("Order ID and status are required");
  if (!VALID_STATUSES.includes(status)) throw AppError.badRequest("Invalid status");

  const order = await orderModel.findByIdAndUpdate(orderId, {
    status,
    $push: { statusHistory: { status, timestamp: new Date() } }
  }, { new: true });
  if (!order) throw AppError.notFound("Order");

  res.json({ success: true, message: "Status Updated", data: { status: order.status } });
});

export { placeOrder, verifyOrder, userOrders, listOrders, updateStatus };
