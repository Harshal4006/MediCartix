import userModel from "../models/userModel.js";

// ADD TO CART

const addToCart = async (req, res) => {
  try {

    const { userId, itemId } = req.body;

    const userData = await userModel.findById(userId);

    let cartData = userData.cartData;

    if (!cartData[itemId]) {
      cartData[itemId] = 1;
    } else {
      cartData[itemId] += 1;
    }

    await userModel.findByIdAndUpdate(userId, { cartData });

    res.json({ success: true, message: "Added To Cart" });

  } catch (error) {
    console.log(error);
    res.json({ success:false, message:"Error" });
  }
};


// REMOVE FROM CART

const removeFromCart = async (req, res) => {
  try {

    const { userId, itemId } = req.body;

    const userData = await userModel.findById(userId);

    let cartData = userData.cartData;

    if (cartData[itemId] > 0) {
      cartData[itemId] -= 1;
    }

    await userModel.findByIdAndUpdate(userId, { cartData });

    res.json({ success:true, message:"Removed From Cart" });

  } catch (error) {
    console.log(error);
    res.json({ success:false, message:"Error" });
  }
};


// GET USER CART

const getCart = async (req, res) => {
  try {

    const { userId } = req.body;

    const userData = await userModel.findById(userId);

    res.json({
      success: true,
      cartData: userData.cartData || {}
    });

  } catch (error) {
    console.log("GET CART ERROR:", error);
    res.json({
      success: false,
      message: "Error"
    });
  }
};

export { addToCart, removeFromCart, getCart };