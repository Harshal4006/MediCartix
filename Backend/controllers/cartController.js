import userModel from "../models/userModel.js";
import { logger } from "../config/logger.js";

const addToCart = async (req, res) => {
  try {
    const { userId, itemId } = req.body;

    if (!itemId) {
      return res.status(400).json({ success: false, message: "Item ID is required" });
    }

    const userData = await userModel.findById(userId).select("cartData");
    if (!userData) {
      return res.status(404).json({ success: false, message: "User Not Found" });
    }

    let cartData = userData.cartData || {};

    if (!cartData[itemId]) {
      cartData[itemId] = 1;
    } else {
      cartData[itemId] += 1;
    }

    await userModel.findByIdAndUpdate(userId, { cartData });

    res.json({ success: true, message: "Added To Cart" });
  } catch (error) {
    logger.error("Add to cart error:", error);
    res.status(500).json({ success: false, message: "Error adding to cart" });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const { userId, itemId } = req.body;

    if (!itemId) {
      return res.status(400).json({ success: false, message: "Item ID is required" });
    }

    const userData = await userModel.findById(userId).select("cartData");
    if (!userData) {
      return res.status(404).json({ success: false, message: "User Not Found" });
    }

    let cartData = userData.cartData || {};

    if (cartData[itemId] > 0) {
      cartData[itemId] -= 1;
      if (cartData[itemId] === 0) {
        delete cartData[itemId];
      }
    }

    await userModel.findByIdAndUpdate(userId, { cartData });

    res.json({ success: true, message: "Removed From Cart" });
  } catch (error) {
    logger.error("Remove from cart error:", error);
    res.status(500).json({ success: false, message: "Error removing from cart" });
  }
};

const getCart = async (req, res) => {
  try {
    const { userId } = req.body;

    const userData = await userModel.findById(userId).select("cartData");
    if (!userData) {
      return res.status(404).json({ success: false, message: "User Not Found" });
    }

    res.json({
      success: true,
      cartData: userData.cartData || {}
    });
  } catch (error) {
    logger.error("Get cart error:", error);
    res.status(500).json({ success: false, message: "Error fetching cart" });
  }
};

export { addToCart, removeFromCart, getCart };
