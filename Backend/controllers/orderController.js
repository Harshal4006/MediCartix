import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";

// PLACE ORDER

const placeOrder = async (req, res) => {

  try {

    const { userId, items, amount, address, paymentMethod } = req.body;

    const newOrder = new orderModel({
      userId,
      items,
      amount,
      address,
      paymentMethod,
      payment: false
    });

    await newOrder.save();

    await userModel.findByIdAndUpdate(userId, {
      cartData: {}
    });

    res.json({
      success: true,
      orderId: newOrder._id,
      message: "Order Created"
    });

  } catch (error) {

    console.log(error);

    res.json({
      success: false,
      message: "Error"
    });

  }

};



// VERIFY PAYMENT

const verifyOrder = async (req, res) => {

  try {

    const { orderId, success } = req.body;

    if (success) {

      await orderModel.findByIdAndUpdate(orderId, {
        payment: true
      });

      res.json({
        success: true,
        message: "Payment Successful"
      });

    } else {

      await orderModel.findByIdAndDelete(orderId);

      res.json({
        success: false,
        message: "Payment Failed"
      });

    }

  } catch (error) {

    console.log(error);

    res.json({
      success: false,
      message: "Error"
    });

  }

};


// USER ORDERS FOR FRONTEND

const userOrders = async (req, res) => {

  try {

    const userId = req.body.userId;

    const orders = await orderModel.find({ userId });

    res.json({
      success:true,
      data:orders
    });

  } catch (error) {

    console.log(error);

    res.json({
      success:false,
      message:"Error"
    });

  }

};


// LISTING ORDERS FOR ADMIN PANEL

const listOrders = async (req,res)=>{

  try{

    const orders = await orderModel.find({});

    res.json({
      success:true,
      data:orders
    })

  }catch(error){

    console.log(error)

    res.json({
      success:false,
      message:"Error"
    })

  }

};

// ADMIN SHOULD BE ABLE TO CHANGE ORDER STATUS

const updateStatus = async (req,res)=>{

  try{

    await orderModel.findByIdAndUpdate(
      req.body.orderId,
      {status:req.body.status}
    )

    res.json({
      success:true,
      message:"Status Updated"
    })

  }catch(error){

    console.log(error)

    res.json({
      success:false,
      message:"Error"
    })

  }

}


export { placeOrder, verifyOrder, userOrders, listOrders, updateStatus };