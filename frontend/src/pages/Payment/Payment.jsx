import React, { useContext, useState, useEffect } from "react";
import "./Payment.css";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { StoreContext } from "../../context/StoreContext";

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Payment = () => {
  const { api, token, authChecked } = useContext(StoreContext);
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [amount, setAmount] = useState(location.state?.amount || 0);
  const [processing, setProcessing] = useState(false);
  const [paymentMode, setPaymentMode] = useState(null);
  const [sdkLoaded, setSdkLoaded] = useState(false);

  useEffect(() => {
    loadRazorpayScript().then((loaded) => setSdkLoaded(loaded));
  }, []);

  if (authChecked && !token) {
    navigate("/");
    return null;
  }

  const handleCOD = async () => {
    setProcessing(true);
    setPaymentMode("COD");

    try {
      const response = await api.post("/api/order/verify", {
        orderId,
        success: true,
      });

      if (response.data.success) {
        toast.success("Order placed! Pay on delivery.");
        navigate("/myorders");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Verification failed");
    }

    setProcessing(false);
  };

  const handleRazorpayPayment = async () => {
    if (!sdkLoaded) {
      toast.error("Payment SDK not loaded. Please refresh.");
      return;
    }

    setProcessing(true);
    setPaymentMode("Razorpay");

    try {
      const orderRes = await api.post("/api/payment/create-order", { orderId });

      if (!orderRes.data.success) {
        toast.error(orderRes.data.message || "Failed to create payment");
        setProcessing(false);
        return;
      }

      const { id: razorpayOrderId, amount: razorpayAmount, key } = orderRes.data.data;

      setAmount(razorpayAmount / 100);

      const options = {
        key,
        amount: razorpayAmount,
        currency: "INR",
        name: "MediCartix",
        description: `Order #${orderId}`,
        order_id: razorpayOrderId,
        handler: async function (response) {
          try {
            const verifyRes = await api.post("/api/payment/verify", {
              orderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.data.success) {
              toast.success("Payment successful! 🎉");
              navigate("/myorders");
            }
          } catch (err) {
            toast.error(err.response?.data?.message || "Payment verification failed");
            setProcessing(false);
          }
        },
        modal: {
          ondismiss: () => {
            toast.info("Payment cancelled");
            setProcessing(false);
          },
        },
        prefill: {
          contact: "",
          email: "",
        },
        theme: {
          color: "#22c55e",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", function (response) {
        toast.error(`Payment failed: ${response.error.description}`);
        setProcessing(false);
      });

      razorpay.open();
    } catch (error) {
      toast.error(error.response?.data?.message || "Payment initiation failed");
      setProcessing(false);
    }
  };

  return (
    <div className="checkout">
      <div className="checkout-container">
        <div className="payment-section">
          <h2>Select Payment Method</h2>
          <p className="order-id">Order ID: {orderId}</p>

          <div className="payment-methods">
            <div className="payment-method-card">
              <div className="payment-method-header">
                <span className="payment-method-icon">💵</span>
                <div>
                  <h3>Cash on Delivery</h3>
                  <p>Pay when you receive your order</p>
                </div>
              </div>
              <button
                className="pay-btn cod-btn"
                onClick={handleCOD}
                disabled={processing}
              >
                {processing && paymentMode === "COD" ? "Processing..." : "Place Order (COD)"}
              </button>
            </div>

            <div className="payment-method-card">
              <div className="payment-method-header">
                <span className="payment-method-icon">💳</span>
                <div>
                  <h3>Pay Online</h3>
                  <p>Credit Card, Debit Card, UPI, Net Banking</p>
                </div>
              </div>
              <button
                className="pay-btn online-btn"
                onClick={handleRazorpayPayment}
                disabled={processing || !sdkLoaded}
              >
                {!sdkLoaded
                  ? "Loading payment..."
                  : processing && paymentMode === "Razorpay"
                  ? "Processing..."
                  : `Pay ₹${amount} Online`}
              </button>
            </div>
          </div>
        </div>

        <div className="summary-section">
          <h3>Order Summary</h3>
          <div className="summary-box">
            <p>Subtotal</p>
            <span>₹{Math.max(0, amount - 40)}</span>
          </div>
          <div className="summary-box">
            <p>Delivery</p>
            <span>₹{amount > 0 ? 40 : 0}</span>
          </div>
          <div className="summary-box total">
            <p>Total</p>
            <span>₹{amount}</span>
          </div>
          <p className="secure">🔒 Payments secured by Razorpay</p>
        </div>
      </div>
    </div>
  );
};

export default Payment;
