import orderModel from "../models/orderModel.js";
import medicineModel from "../models/MedicineModel.js";
import userModel from "../models/userModel.js";
import prescriptionModel from "../models/prescriptionModel.js";
import asyncHandler from "../utils/asyncHandler.js";

const getDashboard = asyncHandler(async (req, res) => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [
    totalMedicines,
    totalUsers,
    pendingPrescriptions,
    recentOrders,
    orderStats,
    todayOrders,
  ] = await Promise.all([
    medicineModel.countDocuments({}),
    userModel.countDocuments({}),
    prescriptionModel.countDocuments({ status: "pending" }),
    orderModel.find({}).sort({ date: -1 }).limit(5).lean(),
    orderModel.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: { $cond: ["$payment", "$amount", 0] } },
        },
      },
      { $project: { _id: 0, totalOrders: 1, totalRevenue: 1 } },
    ]),
    orderModel.countDocuments({ date: { $gte: todayStart } }),
  ]);

  const ordersByStatus = await orderModel.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  const stats = orderStats[0] || { totalOrders: 0, totalRevenue: 0 };

  res.json({
    success: true,
    data: {
      totalOrders: stats.totalOrders,
      totalRevenue: stats.totalRevenue,
      totalMedicines,
      totalUsers,
      pendingPrescriptions,
      recentOrders,
      ordersByStatus: ordersByStatus.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      todayOrders,
    },
  });
});

export { getDashboard };
