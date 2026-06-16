import React, { useEffect, useState } from "react";
import "./Orders.css";
import axios from "axios";
import { BsBoxSeam } from "react-icons/bs";
import { toast } from "react-toastify";

const Orders = () => {
  const url = import.meta.env.VITE_API_URL || "http://localhost:4000";
  const token = localStorage.getItem("adminToken");

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  const fetchOrders = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const params = statusFilter ? `?status=${statusFilter}` : "";
      const response = await axios.get(`${url}/api/order/list${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setOrders(response.data.data);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        localStorage.removeItem("adminToken");
        window.location.href = "/login";
      } else {
        toast.error("Failed to load orders");
      }
    } finally {
      setLoading(false);
    }
  };

  const statusHandler = async (event, orderId) => {
    if (!token) return;

    try {
      await axios.post(
        `${url}/api/order/status`,
        { orderId, status: event.target.value },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Status updated");
      fetchOrders();
    } catch {
      toast.error("Failed to update status");
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  if (!token) {
    return (
      <div className="orders">
        <h2>Orders</h2>
        <p style={{ textAlign: "center", marginTop: 40, color: "#64748b" }}>
          Please login to view orders.
        </p>
      </div>
    );
  }

  return (
    <div className="orders">
      <div className="orders-header">
        <h2>Orders {orders.length > 0 && `(${orders.length})`}</h2>
        <select
          className="status-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Orders</option>
          <option value="Medicine Processing">Processing</option>
          <option value="Out for delivery">Out for delivery</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      <div className="orders-container">
        {loading ? (
          <p className="loading-text">Loading orders...</p>
        ) : orders.length > 0 ? (
          orders.map((order) => (
            <div className="order-item" key={order._id}>
              <BsBoxSeam className="order-icon" />

              <div className="order-info">
                <div className="order-items-list">
                  {order.items.map((item, i) => (
                    <p key={i}>
                      {item.name} x {item.quantity}
                    </p>
                  ))}
                </div>

                <div className="order-meta">
                  <span className="order-amount">₹{order.amount}</span>
                  {order.user && (
                    <span className="order-user">{order.user.name} ({order.user.email})</span>
                  )}
                  <span className="order-city">{order.address?.city || "—"}</span>
                  <span className="order-date">
                    {new Date(order.date).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric"
                    })}
                  </span>
                </div>
              </div>

              <select
                className="status-select"
                onChange={(event) => statusHandler(event, order._id)}
                value={order.status}
              >
                <option value="Medicine Processing">Processing</option>
                <option value="Out for delivery">Out for delivery</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          ))
        ) : (
          <p className="loading-text">
            {statusFilter ? `No orders with status "${statusFilter}"` : "No Orders Found"}
          </p>
        )}
      </div>
    </div>
  );
};

export default Orders;
