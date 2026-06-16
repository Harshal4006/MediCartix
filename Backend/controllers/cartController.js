import cartModel from "../models/cartModel.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";

const addToCart = asyncHandler(async (req, res) => {
  const { userId, itemId } = req.body;
  if (!itemId) throw AppError.missingField("Item ID");

  const incResult = await cartModel.findOneAndUpdate(
    { userId, "items.medicineId": itemId },
    { $inc: { "items.$.quantity": 1 } },
    { new: true }
  );

  if (!incResult) {
    await cartModel.findOneAndUpdate(
      { userId },
      { $push: { items: { medicineId: itemId, quantity: 1 } } },
      { upsert: true }
    );
  }

  res.json({ success: true, message: "Added To Cart" });
});

const removeFromCart = asyncHandler(async (req, res) => {
  const { userId, itemId } = req.body;
  if (!itemId) throw AppError.missingField("Item ID");

  const decResult = await cartModel.findOneAndUpdate(
    { userId, "items.medicineId": itemId, "items.quantity": { $gt: 1 } },
    { $inc: { "items.$.quantity": -1 } },
    { new: true }
  );

  if (!decResult) {
    await cartModel.findOneAndUpdate(
      { userId },
      { $pull: { items: { medicineId: itemId } } }
    );
  }

  res.json({ success: true, message: "Removed From Cart" });
});

const getCart = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  const cart = await cartModel.findOne({ userId });

  const cartData = {};
  if (cart) {
    for (const item of cart.items) {
      cartData[item.medicineId] = item.quantity;
    }
  }

  res.json({ success: true, cartData });
});

export { addToCart, removeFromCart, getCart };
