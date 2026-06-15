import Razorpay from "razorpay";
import crypto from "crypto";
import orderModel from "../models/orderModel.js";
import { logger } from "../config/logger.js";

const getRazorpay = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay credentials not configured");
  }

  return new Razorpay({ key_id: keyId, key_secret: keySecret });
};

const createOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ success: false, message: "Order ID is required" });
    }

    const order = await orderModel.findById(orderId).select("amount userId paymentMethod payment status");

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (String(order.userId) !== String(req.body.userId)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    if (order.payment) {
      return res.status(400).json({ success: false, message: "Order already paid" });
    }

    if (order.paymentMethod !== "Razorpay") {
      return res.status(400).json({ success: false, message: "Not a Razorpay order" });
    }

    const razorpay = getRazorpay();

    const options = {
      amount: Math.round(order.amount * 100),
      currency: "INR",
      receipt: `receipt_${order._id}`,
      notes: {
        orderId: String(order._id),
        userId: String(order.userId),
      },
    };

    const razorpayOrder = await razorpay.orders.create(options);

    await orderModel.findByIdAndUpdate(order._id, {
      paymentId: razorpayOrder.id,
    });

    res.json({
      success: true,
      data: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error) {
    logger.error("Create Razorpay order error:", error);
    res.status(500).json({ success: false, message: "Failed to create payment" });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: "Invalid payment verification data" });
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keySecret) {
      logger.error("RAZORPAY_KEY_SECRET not configured");
      return res.status(500).json({ success: false, message: "Payment service misconfigured" });
    }

    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      logger.warn(`Payment signature mismatch for order ${orderId}`);
      return res.status(400).json({ success: false, message: "Payment verification failed" });
    }

    const order = await orderModel.findById(orderId).select("userId paymentMethod payment");

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (String(order.userId) !== String(req.body.userId)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    await orderModel.findByIdAndUpdate(orderId, {
      payment: true,
      status: "Medicine Processing",
      paymentId: razorpay_payment_id,
    });

    res.json({
      success: true,
      message: "Payment verified successfully",
    });
  } catch (error) {
    logger.error("Verify payment error:", error);
    res.status(500).json({ success: false, message: "Payment verification failed" });
  }
};

export { createOrder, verifyPayment };
