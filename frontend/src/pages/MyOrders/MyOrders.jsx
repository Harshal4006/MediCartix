import React, { useContext, useEffect, useState, useRef, useCallback } from "react";
import "./MyOrders.css";
import { StoreContext } from "../../context/StoreContext";
import { FaBoxOpen, FaCheck, FaTimes } from "react-icons/fa";
import { Link } from "react-router-dom";

const STEPS = ["Order Placed", "Medicine Processing", "Out for delivery", "Delivered"];

const TERMINAL_STATUSES = ["Cancelled", "Payment Failed"];

const getStepState = (orderStatus, stepIndex) => {
  const currentIndex = STEPS.indexOf(orderStatus);
  if (currentIndex === -1) return "inactive";
  if (stepIndex < currentIndex) return "completed";
  if (stepIndex === currentIndex) return "current";
  return "pending";
};

const TimelineStepper = ({ status }) => {
  if (TERMINAL_STATUSES.includes(status)) {
    return (
      <div className="timeline cancelled">
        {STEPS.map((step, i) => {
          const state = getStepState(status, i);
          return (
            <div className={`tl-step ${state}`} key={step}>
              <div className="tl-dot">
                {state === "completed" ? <FaCheck /> : null}
              </div>
              {i < STEPS.length - 1 && <div className="tl-line" />}
            </div>
          );
        })}
        <div className="tl-step terminal">
          <div className="tl-dot cancelled">
            <FaTimes />
          </div>
          <div className="tl-label">{status}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="timeline">
      {STEPS.map((step, i) => {
        const state = getStepState(status, i);
        return (
          <div className={`tl-step ${state}`} key={step}>
            <div className="tl-dot">
              {state === "completed" ? <FaCheck /> : null}
            </div>
            {i < STEPS.length - 1 && <div className="tl-line" />}
            <span className="tl-label">{step}</span>
          </div>
        );
      })}
    </div>
  );
};

const MyOrders = () => {
  const { api, token, authChecked } = useContext(StoreContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const pageRef = useRef(1);
  const [hasMore, setHasMore] = useState(false);

  const fetchOrders = useCallback(async (pageNum = 1) => {
    try {
      setLoading(true);
      setError("");
      const response = await api.post(`/api/order/userorders?page=${pageNum}&limit=10`);

      if (response.data.success) {
        if (pageNum === 1) {
          setOrders(response.data.data);
        } else {
          setOrders((prev) => [...prev, ...response.data.data]);
        }
        setHasMore(response.data.pagination?.hasMore || false);
      }
    } catch {
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    if (token) {
      fetchOrders(1);
    } else {
      setLoading(false);
    }
  }, [token, fetchOrders]);

  if (authChecked && !token) {
    return (
      <div className="myorders">
        <div className="myorders-empty">
          <FaBoxOpen className="empty-icon" />
          <h2>Login to View Orders</h2>
          <p>Sign in to see your order history.</p>
        </div>
      </div>
    );
  }

  if (loading && orders.length === 0) {
    return (
      <div className="myorders">
        <h2>My Orders</h2>
        <div className="orders-skeleton">
          {[1, 2, 3].map((i) => (
            <div key={i} className="order-skeleton-row">
              <div className="skeleton-icon" />
              <div className="skeleton-text w-60" />
              <div className="skeleton-text w-20" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="myorders">
        <div className="myorders-empty">
          <h2>Something went wrong</h2>
          <p>{error}</p>
          <button className="btn primary" onClick={() => fetchOrders(1)}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="myorders">
        <div className="myorders-empty">
          <FaBoxOpen className="empty-icon" />
          <h2>No Orders Yet</h2>
          <p>Start shopping to see your orders here.</p>
          <Link to="/" className="btn primary">Browse Medicines</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="myorders">
      <h2>My Orders ({orders.length})</h2>
      <div className="orders-container">
        {orders.map((order, index) => (
          <div className="order-row" key={order._id || index}>
            <div className="order-main">
              <FaBoxOpen className="order-icon" />
              <p className="order-items">
                {order.items.map((item, i) => (
                  <span key={i}>
                    {item.name} x {item.quantity}
                    {i !== order.items.length - 1 ? ", " : ""}
                  </span>
                ))}
              </p>
              <p className="order-price">₹{order.amount}</p>
              <p className="order-count">Items: {order.items.length}</p>
              <p className="order-date">
                {new Date(order.date).toLocaleDateString("en-IN", {
                  day: "numeric", month: "short", year: "numeric"
                })}
              </p>
            </div>
            <TimelineStepper status={order.status} />
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="load-more-container">
          <button
            className="btn primary"
            onClick={() => { pageRef.current += 1; fetchOrders(pageRef.current); }}
            disabled={loading}
          >
            {loading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
};

export default MyOrders;
