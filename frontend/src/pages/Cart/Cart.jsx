import React, { useContext, useState } from "react";
import { StoreContext } from "../../context/StoreContext";
import "./Cart.css";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const Cart = () => {
  const {
    url,
    cartItems,
    medicine_list,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    medicineLoading,
  } = useContext(StoreContext);

  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState("");

  const subtotal = getTotalCartAmount();

  const applyCoupon = () => {
    if (appliedCoupon) {
      toast.info("Coupon already applied");
      return;
    }
    if (coupon.toUpperCase() === "MEDI10") {
      const disc = subtotal * 0.1;
      setDiscount(disc);
      setAppliedCoupon(coupon.toUpperCase());
      toast.success(`Coupon applied! You saved ₹${disc.toFixed(0)}`);
    } else {
      toast.error("Invalid coupon code");
    }
  };

  const deliveryFee = subtotal === 0 ? 0 : 40;
  const total = subtotal + deliveryFee - discount;

  if (medicineLoading) {
    return (
      <div className="cart">
        <h2 className="cart-heading">Shopping Cart</h2>
        <div className="cart-skeleton">
          {[1, 2, 3].map((i) => (
            <div key={i} className="cart-skeleton-item">
              <div className="skeleton-image" />
              <div className="skeleton-lines">
                <div className="skeleton-line w-40" />
                <div className="skeleton-line w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (subtotal === 0 && !medicineLoading) {
    return (
      <div className="cart">
        <h2 className="cart-heading">Shopping Cart</h2>
        <div className="empty-cart">
          <div className="empty-cart-icon">🛒</div>
          <h2>Your Cart is Empty</h2>
          <p>Add medicines from our menu to start shopping.</p>
          <Link to="/" className="btn primary shop-now-btn">
            Browse Medicines
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart">
      <h2 className="cart-heading">Shopping Cart ({getTotalCartAmount() > 0 ? `${Object.keys(cartItems).length} items` : ""})</h2>

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
                    <img src={`${url}/images/${item.image}`} alt={item.name} loading="lazy" />
                    <p>{item.name}</p>
                  </div>
                  <p className="price-col">₹ {item.price}</p>
                  <div className="qty-control">
                    <button onClick={() => removeFromCart(item._id)} aria-label="Decrease quantity">−</button>
                    <span>{cartItems[item._id]}</span>
                    <button onClick={() => addToCart(item._id)} aria-label="Increase quantity">+</button>
                  </div>
                  <p>₹ {item.price * cartItems[item._id]}</p>
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
            <span>₹ {subtotal.toFixed(0)}</span>
          </div>
          <div className="summary-row">
            <span>Delivery Fee</span>
            <span>₹ {deliveryFee}</span>
          </div>
          {discount > 0 && (
            <div className="summary-row discount">
              <span>Discount ({appliedCoupon})</span>
              <span>- ₹ {discount.toFixed(0)}</span>
            </div>
          )}
          <hr />
          <div className="summary-row total">
            <b>Total</b>
            <b>₹ {total.toFixed(0)}</b>
          </div>
          <Link to="/order">
            <button className="checkout-btn">Proceed to Checkout</button>
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
              onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
            />
            <button onClick={applyCoupon}>Apply</button>
          </div>
          {appliedCoupon && <small className="coupon-applied">✓ Coupon {appliedCoupon} applied</small>}
          {!appliedCoupon && <small>Try: <b>MEDI10</b> for 10% discount</small>}
        </div>
      </div>
    </div>
  );
};

export default Cart;
