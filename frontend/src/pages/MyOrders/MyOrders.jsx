import React, { useContext, useEffect, useState } from "react";
import "./MyOrders.css";
import { StoreContext } from "../../context/StoreContext";
import { FaBoxOpen } from "react-icons/fa";
import { Link } from "react-router-dom";

const STATUS_COLORS = {
  "Medicine Processing": "#f59e0b",
  "Out for delivery": "#3b82f6",
  "Delivered": "#22c55e",
  "Cancelled": "#ef4444",
  "Payment Failed": "#ef4444",
};

const MyOrders = () => {
  const { api, token } = useContext(StoreContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const fetchOrders = async (pageNum = 1) => {
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
    } catch (err) {
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchOrders(1);
    } else {
      setLoading(false);
    }
  }, [token]);

  if (!token) {
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
            <p
              className="order-status"
              style={{ color: STATUS_COLORS[order.status] || "#64748b" }}
            >
              ● {order.status}
            </p>
            <p className="order-date">
              {new Date(order.date).toLocaleDateString("en-IN", {
                day: "numeric", month: "short", year: "numeric"
              })}
            </p>
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="load-more-container">
          <button
            className="btn primary"
            onClick={() => fetchOrders(page + 1)}
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
