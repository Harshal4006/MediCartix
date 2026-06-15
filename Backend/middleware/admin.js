import userModel from "../models/userModel.js";
import { logger } from "../config/logger.js";

const adminMiddleware = async (req, res, next) => {
  try {
    const userId = req.userId || req.body?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const user = await userModel.findById(userId).select("role email name");

    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    if (user.role !== "admin") {
      logger.warn(`Unauthorized admin access attempt by ${user.email} (${userId})`);
      return res.status(403).json({ success: false, message: "Admin access required" });
    }

    req.admin = { id: user._id, email: user.email, name: user.name };
    next();
  } catch (error) {
    logger.error("Admin middleware error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export default adminMiddleware;
