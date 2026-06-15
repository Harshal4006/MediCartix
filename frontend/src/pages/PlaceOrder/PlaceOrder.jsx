import React, { useContext, useState } from "react";
import "./PlaceOrder.css";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const PlaceOrder = () => {
  const navigate = useNavigate();

  const {
    cartItems,
    medicine_list,
    getTotalCartAmount,
    getTotalCartItems,
    setCartItems,
    token,
    api,
  } = useContext(StoreContext);

  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!data.firstName.trim()) errs.firstName = "Required";
    if (!data.lastName.trim()) errs.lastName = "Required";
    if (!data.email.trim()) errs.email = "Required";
    else if (!/\S+@\S+\.\S+/.test(data.email)) errs.email = "Invalid email";
    if (!data.street.trim()) errs.street = "Required";
    if (!data.city.trim()) errs.city = "Required";
    if (!data.state.trim()) errs.state = "Required";
    if (!data.zipcode.trim()) errs.zipcode = "Required";
    if (!data.country.trim()) errs.country = "Required";
    if (!data.phone.trim()) errs.phone = "Required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  if (!token) {
    return (
      <div className="place-order-login-warning">
        <h2>Login Required</h2>
        <p>Please sign in to place an order.</p>
      </div>
    );
  }

  if (getTotalCartItems() === 0) {
    return (
      <div className="place-order-login-warning">
        <h2>Your cart is empty</h2>
        <p>Add items to your cart before placing an order.</p>
      </div>
    );
  }

  const placeOrder = async (event) => {
    event.preventDefault();
    if (!validate() || loading) return;

    setLoading(true);

    let orderItems = [];
    medicine_list.forEach((item) => {
      if (cartItems[item._id] > 0) {
        orderItems.push({
          _id: item._id,
          name: item.name,
          price: item.price,
          quantity: cartItems[item._id],
        });
      }
    });

    const orderData = {
      items: orderItems,
      amount: getTotalCartAmount() + 40,
      address: data,
      paymentMethod,
    };

    try {
      const response = await api.post("/api/order/place", orderData);

      if (response.data.success) {
        setCartItems({});
        toast.success("Order placed successfully!");
        navigate("/payment/" + response.data.orderId, {
          state: { amount: orderData.amount },
        });
      }
    } catch (error) {
      const message = error.response?.data?.message || "Something went wrong";
      toast.error(message);
    }

    setLoading(false);
  };

  return (
    <form className="place-order" onSubmit={placeOrder}>
      <div className="place-order-left">
        <h2>Delivery Information</h2>

        <div className="multi-fields">
          <div className="field-group">
            <input
              name="firstName"
              value={data.firstName}
              onChange={onChangeHandler}
              type="text"
              placeholder="First Name"
              className={errors.firstName ? "input-error" : ""}
              required
            />
            {errors.firstName && <span className="field-error">{errors.firstName}</span>}
          </div>
          <div className="field-group">
            <input
              name="lastName"
              value={data.lastName}
              onChange={onChangeHandler}
              type="text"
              placeholder="Last Name"
              className={errors.lastName ? "input-error" : ""}
              required
            />
            {errors.lastName && <span className="field-error">{errors.lastName}</span>}
          </div>
        </div>

        <div className="field-group">
          <input
            name="email"
            value={data.email}
            onChange={onChangeHandler}
            type="email"
            placeholder="Email Address"
            className={errors.email ? "input-error" : ""}
            required
          />
          {errors.email && <span className="field-error">{errors.email}</span>}
        </div>

        <div className="field-group">
          <input
            name="street"
            value={data.street}
            onChange={onChangeHandler}
            type="text"
            placeholder="Street Address"
            className={errors.street ? "input-error" : ""}
            required
          />
          {errors.street && <span className="field-error">{errors.street}</span>}
        </div>

        <div className="multi-fields">
          <div className="field-group">
            <input
              name="city"
              value={data.city}
              onChange={onChangeHandler}
              type="text"
              placeholder="City"
              className={errors.city ? "input-error" : ""}
              required
            />
            {errors.city && <span className="field-error">{errors.city}</span>}
          </div>
          <div className="field-group">
            <input
              name="state"
              value={data.state}
              onChange={onChangeHandler}
              type="text"
              placeholder="State"
              className={errors.state ? "input-error" : ""}
              required
            />
            {errors.state && <span className="field-error">{errors.state}</span>}
          </div>
        </div>

        <div className="multi-fields">
          <div className="field-group">
            <input
              name="zipcode"
              value={data.zipcode}
              onChange={onChangeHandler}
              type="text"
              placeholder="Zip Code"
              className={errors.zipcode ? "input-error" : ""}
              required
            />
            {errors.zipcode && <span className="field-error">{errors.zipcode}</span>}
          </div>
          <div className="field-group">
            <input
              name="country"
              value={data.country}
              onChange={onChangeHandler}
              type="text"
              placeholder="Country"
              className={errors.country ? "input-error" : ""}
              required
            />
            {errors.country && <span className="field-error">{errors.country}</span>}
          </div>
        </div>

        <div className="field-group">
          <input
            name="phone"
            value={data.phone}
            onChange={onChangeHandler}
            type="tel"
            placeholder="Phone Number"
            className={errors.phone ? "input-error" : ""}
            required
          />
          {errors.phone && <span className="field-error">{errors.phone}</span>}
        </div>
      </div>

      <div className="place-order-right">
        <div className="order-summary">
          <h2>Payment Method</h2>
          <div className="payment-selector">
            <label className={`payment-option ${paymentMethod === "COD" ? "active" : ""}`}>
              <input
                type="radio"
                name="paymentMethod"
                value="COD"
                checked={paymentMethod === "COD"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span>💵 Cash on Delivery</span>
            </label>
            <label className={`payment-option ${paymentMethod === "Razorpay" ? "active" : ""}`}>
              <input
                type="radio"
                name="paymentMethod"
                value="Razorpay"
                checked={paymentMethod === "Razorpay"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span>💳 Pay Online (Card/UPI)</span>
            </label>
          </div>

          <hr />
          <h2>Order Summary</h2>
          <div className="summary-row">
            <p>Subtotal</p>
            <p>₹{getTotalCartAmount()}</p>
          </div>
          <div className="summary-row">
            <p>Delivery Fee</p>
            <p>₹{getTotalCartAmount() === 0 ? 0 : 40}</p>
          </div>
          <hr />
          <div className="summary-row total">
            <p>Total</p>
            <p>₹{getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + 40}</p>
          </div>
          <button type="submit" className="place-btn" disabled={loading}>
            {loading ? "Placing Order..." : "Proceed To Payment"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;
