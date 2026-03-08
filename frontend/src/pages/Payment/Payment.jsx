import React from "react";
import "./Payment.css";
import axios from "axios";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";

const Payment = () => {

  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const amount = location.state?.amount || 0;

  const handleSuccess = async () => {

    const response = await axios.post(
      ""https://medicartix-backend.onrender.com/api/order/verify"",
      {
        orderId,
        success: true
      }
    );

    if(response.data.success){
      toast.success("Payment Successful 🎉");
      navigate("/myorders");
    }

  };

  const handleCancel = async () => {

    await axios.post(
      ""https://medicartix-backend.onrender.com/api/order/verify"",
      {
        orderId,
        success:false
      }
    );

    alert("Payment Cancelled");
    navigate("/cart");

  };

  return (

    <div className="checkout">

      <div className="checkout-container">

        <div className="payment-section">

          <h2>Payment Details</h2>

          <p className="order-id">
            Order ID: {orderId}
          </p>

          <div className="card-box">

            <label>Card Number</label>
            <input placeholder="Enter Your Card Number"/>

            <label>Cardholder Name</label>
            <input placeholder="Enter Your Name "/>

            <div className="row">

              <div>
                <label>Expiry</label>
                <input placeholder="MM/YY"/>
              </div>

              <div>
                <label>CVV</label>
                <input placeholder="123"/>
              </div>

            </div>

          </div>

          <div className="buttons">

            <button
              className="pay-btn"
              onClick={handleSuccess}
            >
              Pay Now
            </button>

            <button
              className="cancel-btn"
              onClick={handleCancel}
            >
              Cancel
            </button>

          </div>

        </div>

        <div className="summary-section">

          <h3>Order Summary</h3>

          <div className="summary-box">
            <p>Subtotal</p>
            <span>₹{amount === 0 ? 0 : amount-40}</span>
          </div>

          <div className="summary-box">
            <p>Delivery</p>
            <span>₹{amount === 0 ? 0 : 40}</span>
          </div>

          <div className="summary-box total">
            <p>Total</p>
            <span>₹{amount}</span>
          </div>

          <p className="secure">
            🔒 Secure Checkout
          </p>

        </div>

      </div>

    </div>

  );

};

export default Payment;
