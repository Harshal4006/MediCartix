import orderModel from "../models/orderModel.js";
import medicineModel from "../models/MedicineModel.js";
import userModel from "../models/userModel.js";
import prescriptionModel from "../models/prescriptionModel.js";
import { logger } from "../config/logger.js";

const getDashboard = async (req, res) => {
  try {
    const [
      totalOrders,
      totalRevenue,
      totalMedicines,
      totalUsers,
      pendingPrescriptions,
      recentOrders,
      ordersByStatus,
    ] = await Promise.all([
      orderModel.countDocuments({}),
      orderModel.aggregate([
        { $match: { payment: true } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      medicineModel.countDocuments({}),
      userModel.countDocuments({}),
      prescriptionModel.countDocuments({ status: "pending" }),
      orderModel.find({}).sort({ date: -1 }).limit(5).lean(),
      orderModel.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        totalMedicines,
        totalUsers,
        pendingPrescriptions,
        recentOrders,
        ordersByStatus: ordersByStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        todayOrders: await orderModel.countDocuments({
          date: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        }),
      },
    });
  } catch (error) {
    logger.error("Dashboard error:", error);
    res.status(500).json({ success: false, message: "Error fetching dashboard data" });
  }
};

export { getDashboard };
