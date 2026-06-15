import React, { useEffect, useState } from "react";
import "./Dashboard.css";
import axios from "axios";
import { BsBoxSeam, BsCurrencyRupee, BsPeople, BsCapsule } from "react-icons/bs";

const StatCard = ({ icon, label, value, color }) => (
  <div className="stat-card" style={{ borderLeftColor: color }}>
    <div className="stat-icon" style={{ background: `${color}15`, color }}>
      {icon}
    </div>
    <div className="stat-info">
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
    </div>
  </div>
);

const Dashboard = () => {
  const url = import.meta.env.VITE_API_URL || "http://localhost:4000";
  const token = localStorage.getItem("adminToken");

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;

    axios
      .get(`${url}/api/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (res.data.success) setData(res.data.data);
      })
      .catch(() => setError("Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="dashboard">
        <h2>Dashboard</h2>
        <div className="stats-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="stat-card-skeleton" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <h2>Dashboard</h2>
        <p className="error-text">{error}</p>
      </div>
    );
  }

  const statusColors = {
    "Medicine Processing": "#f59e0b",
    "Out for delivery": "#3b82f6",
    Delivered: "#22c55e",
    Cancelled: "#ef4444",
    "Payment Failed": "#ef4444",
  };

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>

      <div className="stats-grid">
        <StatCard
          icon={<BsCurrencyRupee />}
          label="Total Revenue"
          value={`₹${(data?.totalRevenue || 0).toLocaleString()}`}
          color="#22c55e"
        />
        <StatCard
          icon={<BsBoxSeam />}
          label="Total Orders"
          value={data?.totalOrders || 0}
          color="#3b82f6"
        />
        <StatCard
          icon={<BsCapsule />}
          label="Medicines"
          value={data?.totalMedicines || 0}
          color="#f59e0b"
        />
        <StatCard
          icon={<BsPeople />}
          label="Users"
          value={data?.totalUsers || 0}
          color="#8b5cf6"
        />
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-section">
          <h3>Orders by Status</h3>
          <div className="status-list">
            {data?.ordersByStatus &&
              Object.entries(data.ordersByStatus).map(([status, count]) => (
                <div key={status} className="status-row">
                  <span
                    className="status-dot"
                    style={{ background: statusColors[status] || "#94a3b8" }}
                  />
                  <span className="status-name">{status}</span>
                  <span className="status-count">{count}</span>
                </div>
              ))}
            {(!data?.ordersByStatus ||
              Object.keys(data.ordersByStatus).length === 0) && (
              <p className="no-data">No orders yet</p>
            )}
          </div>
        </div>

        <div className="dashboard-section">
          <h3>Recent Orders</h3>
          <div className="recent-orders">
            {data?.recentOrders?.length > 0 ? (
              data.recentOrders.map((order) => (
                <div key={order._id} className="recent-order-row">
                  <span className="ro-id">#{order._id.slice(-6)}</span>
                  <span className="ro-amount">₹{order.amount}</span>
                  <span
                    className="ro-status"
                    style={{ color: statusColors[order.status] || "#94a3b8" }}
                  >
                    {order.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="no-data">No recent orders</p>
            )}
          </div>
        </div>
      </div>

      <div className="dashboard-section quick-actions">
        <h3>Quick Actions</h3>
        <div className="actions-grid">
          <a href="/add" className="action-card">Add Medicine</a>
          <a href="/list" className="action-card">View Medicines</a>
          <a href="/orders" className="action-card">Manage Orders</a>
          <a href="/prescriptions" className="action-card">Review Prescriptions ({data?.pendingPrescriptions || 0})</a>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
