import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import { logger } from "../config/logger.js";

const placeOrder = async (req, res) => {
  try {
    const { userId, items, amount, address, paymentMethod } = req.body;

    if (!userId || !Array.isArray(items) || items.length === 0 || !address) {
      return res.status(400).json({ success: false, message: "Invalid order data" });
    }

    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0 || parsedAmount > 1000000) {
      return res.status(400).json({ success: false, message: "Invalid amount" });
    }

    const validMethods = ["COD", "Razorpay", "Stripe"];
    const method = paymentMethod || "COD";
    if (!validMethods.includes(method)) {
      return res.status(400).json({ success: false, message: "Invalid payment method" });
    }

    const user = await userModel.findById(userId).select("_id cartData");
    if (!user) {
      return res.status(404).json({ success: false, message: "User Not Found" });
    }

    const newOrder = new orderModel({
      userId,
      items: items.map((item) => ({
        medicineId: item._id || item.medicineId,
        name: item.name,
        quantity: item.quantity || 1,
        price: item.price
      })),
      amount: parsedAmount,
      address,
      paymentMethod: method,
      payment: false
    });

    await newOrder.save();

    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    res.status(201).json({
      success: true,
      orderId: newOrder._id,
      message: "Order Created"
    });
  } catch (error) {
    logger.error("Place order error:", error);
    res.status(500).json({ success: false, message: "Error creating order" });
  }
};

const verifyOrder = async (req, res) => {
  try {
    const { orderId, success, paymentId } = req.body;

    if (!orderId) {
      return res.status(400).json({ success: false, message: "Order ID is required" });
    }

    const order = await orderModel.findById(orderId).select("userId payment amount");
    if (!order) {
      return res.status(404).json({ success: false, message: "Order Not Found" });
    }

    if (String(order.userId) !== String(req.body.userId)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    if (success) {
      const updateData = { payment: true };
      if (paymentId) {
        updateData.paymentId = paymentId;
      }

      await orderModel.findByIdAndUpdate(orderId, updateData);

      return res.json({
        success: true,
        message: "Payment Successful"
      });
    }

    await orderModel.findByIdAndUpdate(orderId, {
      payment: false,
      status: "Payment Failed"
    });

    res.json({
      success: false,
      message: "Payment Failed"
    });
  } catch (error) {
    logger.error("Verify order error:", error);
    res.status(500).json({ success: false, message: "Error verifying payment" });
  }
};

const userOrders = async (req, res) => {
  try {
    const userId = req.body.userId;

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(20, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      orderModel.find({ userId }).sort({ date: -1 }).skip(skip).limit(limit),
      orderModel.countDocuments({ userId })
    ]);

    res.json({
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasMore: skip + orders.length < total
      }
    });
  } catch (error) {
    logger.error("User orders error:", error);
    res.status(500).json({ success: false, message: "Error fetching orders" });
  }
};

const listOrders = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;
    const status = req.query.status;

    const filter = {};
    if (status && ["Medicine Processing", "Out for delivery", "Delivered", "Cancelled", "Payment Failed"].includes(status)) {
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
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasMore: skip + orders.length < total
      }
    });
  } catch (error) {
    logger.error("List orders error:", error);
    res.status(500).json({ success: false, message: "Error fetching orders" });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    if (!orderId || !status) {
      return res.status(400).json({ success: false, message: "Order ID and status are required" });
    }

    const validStatuses = ["Medicine Processing", "Out for delivery", "Delivered", "Cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const order = await orderModel.findByIdAndUpdate(orderId, { status }, { new: true });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.json({ success: true, message: "Status Updated", data: { status: order.status } });
  } catch (error) {
    logger.error("Update status error:", error);
    res.status(500).json({ success: false, message: "Error updating status" });
  }
};

export { placeOrder, verifyOrder, userOrders, listOrders, updateStatus };
