import Razorpay from "razorpay";
import crypto from "crypto";
import orderModel from "../models/orderModel.js";
import { logger } from "../config/logger.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";

const getRazorpay = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) throw new Error("Razorpay credentials not configured");
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
};

const createOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.body;
  if (!orderId) throw AppError.missingField("Order ID");

  const order = await orderModel.findById(orderId).select("amount userId paymentMethod payment status");
  if (!order) throw AppError.notFound("Order");
  if (String(order.userId) !== String(req.body.userId)) throw AppError.forbidden();
  if (order.payment) throw AppError.badRequest("Order already paid");
  if (order.paymentMethod !== "Razorpay") throw AppError.badRequest("Not a Razorpay order");

  if (order.razorpayOrderId) throw AppError.badRequest("Razorpay order already created for this order");

  const razorpay = getRazorpay();

  const amountInPaise = Math.round(order.amount * 100);

  const razorpayOrder = await razorpay.orders.create({
    amount: amountInPaise,
    currency: "INR",
    receipt: `receipt_${order._id}`,
    notes: { orderId: String(order._id), userId: String(order.userId) },
  });

  await orderModel.findByIdAndUpdate(order._id, { razorpayOrderId: razorpayOrder.id });

  res.json({
    success: true,
    data: {
      id: razorpayOrder.id,
      amount: amountInPaise,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
    },
  });
});

const verifyPayment = asyncHandler(async (req, res) => {
  const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw AppError.badRequest("Invalid payment verification data");
  }

  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) throw AppError.badRequest("Payment service misconfigured");

  const expectedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    logger.warn(`Payment signature mismatch for order ${orderId}`);
    throw AppError.badRequest("Payment verification failed");
  }

  const order = await orderModel.findById(orderId).select(
    "userId paymentMethod payment amount razorpayOrderId"
  );
  if (!order) throw AppError.notFound("Order");
  if (String(order.userId) !== String(req.body.userId)) throw AppError.forbidden();

  if (order.payment) throw AppError.badRequest("Order already paid");

  const razorpay = getRazorpay();

  const razorpayOrder = await razorpay.orders.fetch(razorpay_order_id);

  const paidAmount = razorpayOrder.amount_paid;
  const expectedAmount = Math.round(order.amount * 100);

  if (paidAmount !== expectedAmount) {
    logger.error(`Amount mismatch for order ${orderId}: paid ${paidAmount}, expected ${expectedAmount}`);
    throw AppError.badRequest("Payment amount does not match order amount");
  }

  await orderModel.findByIdAndUpdate(orderId, {
    payment: true,
    status: "Medicine Processing",
    paymentId: razorpay_payment_id,
  });

  res.json({ success: true, message: "Payment verified successfully" });
});

const handleRazorpayWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      logger.error("RAZORPAY_WEBHOOK_SECRET not configured");
      return res.status(500).json({ success: false, message: "Webhook misconfigured" });
    }

    const signature = req.headers["x-razorpay-signature"];
    if (!signature) {
      return res.status(400).json({ success: false, message: "Missing signature" });
    }

    const bodyStr = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
    const expectedSig = crypto
      .createHmac("sha256", webhookSecret)
      .update(bodyStr)
      .digest("hex");

    if (expectedSig !== signature) {
      logger.warn("Razorpay webhook: invalid signature");
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    const payload = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const event = payload.event;
    const payment = payload.payload?.payment?.entity;

    if (event === "payment.captured" && payment) {
      const orderId = payment.notes?.orderId;
      if (orderId) {
        const order = await orderModel.findById(orderId).select("amount payment");
        if (order && !order.payment) {
          const paidPaise = payment.amount;
          const expectedPaise = Math.round(order.amount * 100);
          if (paidPaise !== expectedPaise) {
            logger.error(`Webhook amount mismatch for order ${orderId}: paid ${paidPaise}, expected ${expectedPaise}`);
          } else {
            await orderModel.findByIdAndUpdate(orderId, {
              payment: true,
              status: "Medicine Processing",
              paymentId: payment.id,
            });
            logger.info(`Razorpay webhook: payment captured for order ${orderId}`);
          }
        }
      }
    }

    if (event === "payment.failed" && payment) {
      const orderId = payment.notes?.orderId;
      if (orderId) {
        await orderModel.findByIdAndUpdate(orderId, {
          payment: false,
          status: "Payment Failed",
        });
        logger.warn(`Razorpay webhook: payment failed for order ${orderId}`);
      }
    }

    res.json({ status: "ok" });
  } catch (error) {
    logger.error("Razorpay webhook error:", error);
    res.status(500).json({ success: false, message: "Webhook error" });
  }
};

export { createOrder, verifyPayment, handleRazorpayWebhook };
