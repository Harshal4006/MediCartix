import React, { useContext, useState } from "react";
import "./PlaceOrder.css";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const PlaceOrder = () => {
  const navigate = useNavigate();

  const {
    url,
    token,
    cartItems,
    medicine_list,
    getTotalCartAmount,
    setCartItems,
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

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData((data) => ({ ...data, [name]: value }));
  };

  const placeOrder = async (event) => {
    event.preventDefault();

    let orderItems = [];

    medicine_list.forEach((item) => {
      if (cartItems[item._id] > 0) {
        let itemInfo = { ...item };
        itemInfo.quantity = cartItems[item._id];
        orderItems.push(itemInfo);
      }
    });

    const orderData = {
      items: orderItems,
      amount: getTotalCartAmount() + 40,
      address: data,
    };

    try {
      const response = await axios.post(url + "/api/order/place", orderData, {
        headers: { token },
      });

      if (response.data.success) {
        setCartItems({});

        // Redirect to payment page
        navigate("/payment/" + response.data.orderId, {
          state: { amount: orderData.amount },
        });
      } else {
        alert("Error placing order");
      }
    } catch (error) {
      console.log(error);
      alert("Something went wrong");
    }
  };

  return (
    <form className="place-order" onSubmit={placeOrder}>
      <div className="place-order-left">
        <h2>Delivery Information</h2>

        <div className="multi-fields">
          <input
            name="firstName"
            onChange={onChangeHandler}
            type="text"
            placeholder="First Name"
            required
          />
          <input
            name="lastName"
            onChange={onChangeHandler}
            type="text"
            placeholder="Last Name"
            required
          />
        </div>

        <input
          name="email"
          onChange={onChangeHandler}
          type="email"
          placeholder="Email Address"
          required
        />
        <input
          name="street"
          onChange={onChangeHandler}
          type="text"
          placeholder="Street Address"
          required
        />

        <div className="multi-fields">
          <input
            name="city"
            onChange={onChangeHandler}
            type="text"
            placeholder="City"
            required
          />
          <input
            name="state"
            onChange={onChangeHandler}
            type="text"
            placeholder="State"
            required
          />
        </div>

        <div className="multi-fields">
          <input
            name="zipcode"
            onChange={onChangeHandler}
            type="text"
            placeholder="Zip Code"
            required
          />
          <input
            name="country"
            onChange={onChangeHandler}
            type="text"
            placeholder="Country"
            required
          />
        </div>

        <input
          name="phone"
          onChange={onChangeHandler}
          type="text"
          placeholder="Phone Number"
          required
        />
      </div>

      <div className="place-order-right">
        <div className="order-summary">
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

          <button type="submit" className="place-btn">
            Proceed To Payment
          </button>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;
