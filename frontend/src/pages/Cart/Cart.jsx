import React, { useContext, useState } from "react";
import { StoreContext } from "../../context/StoreContext";
import "./Cart.css";
import { Link } from "react-router-dom";

const Cart = () => {

  const {
    cartItems,
    medicine_list,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
  } = useContext(StoreContext);

  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);

  const subtotal = getTotalCartAmount();

  const applyCoupon = () => {
    if (coupon === "MEDI10") {
      setDiscount(subtotal * 0.1);
      alert("Coupon Applied ✅");
    } else {
      alert("Invalid Coupon ❌");
    }
  };

  const deliveryFee = subtotal === 0 ? 0 : 40;
  const total = subtotal + deliveryFee - discount;

  if (subtotal === 0) {
    return (
      <div className="empty-cart">
        <h2>Your Cart is Empty 🛒</h2>
        <p>Add medicines to start shopping.</p>
      </div>
    );
  }

  return (
    <div className="cart">

      <h2 className="cart-heading">Shopping Cart</h2>

      <div className="cart-left">

        <div className="cart-items-title">
          <p>Product</p>
          <p className="price-col">Price</p>
          <p>Qty</p>
          <p>Total</p>
        </div>

        <hr />

        {medicine_list.map((item) => {
          if (cartItems[item._id] > 0) {
            return (
              <div key={item._id}>

                <div className="cart-items-item">

                  <div className="product-info">

                    <img
                      src={`https://medicartix-backend.onrender.com/images/${item.image}`}
                      alt={item.name}
                    />

                    <p>{item.name}</p>

                  </div>

                  <p className="price-col">₹ {item.price}</p>

                  <div className="qty-control">
                    <button onClick={() => removeFromCart(item._id)}>
                      -
                    </button>

                    <span>{cartItems[item._id]}</span>

                    <button onClick={() => addToCart(item._id)}>
                      +
                    </button>
                  </div>

                  <p>
                    ₹ {item.price * cartItems[item._id]}
                  </p>

                </div>

                <hr />

              </div>
            );
          }
          return null;
        })}

      </div>

      <div className="cart-bottom">

        <div className="cart-summary">

          <h3>Order Summary</h3>

          <div className="summary-row">
            <span>Subtotal</span>
            <span>₹ {subtotal}</span>
          </div>

          <div className="summary-row">
            <span>Delivery Fee</span>
            <span>₹ {deliveryFee}</span>
          </div>

          {discount > 0 && (
            <div className="summary-row discount">
              <span>Discount</span>
              <span>- ₹ {discount.toFixed(0)}</span>
            </div>
          )}

          <hr />

          <div className="summary-row total">
            <b>Total</b>
            <b>₹ {total.toFixed(0)}</b>
          </div>

          <Link to="/order">
            <button className="checkout-btn">
              Proceed to Checkout
            </button>
          </Link>

        </div>

        <div className="coupon-box">

          <p>Have a Coupon Code?</p>

          <div className="coupon-input">
            <input
              type="text"
              placeholder="Enter coupon"
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
            />

            <button onClick={applyCoupon}>
              Apply
            </button>
          </div>

          <small>
            Try: <b>MEDI10</b> for 10% discount
          </small>

        </div>

      </div>

    </div>
  );
};

export default Cart;
