import React, { useContext, useEffect, useState } from "react";
import "./Profile.css";
import { StoreContext } from "../../context/StoreContext";
import {
  FaUserCircle, FaSave, FaSpinner, FaBoxOpen, FaRupeeSign, FaCalendarAlt,
  FaClipboardList, FaPrescriptionBottleAlt, FaShoppingBag, FaArrowRight
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const Profile = () => {
  const { api, user, setUser, token, authChecked } = useContext(StoreContext);
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "" });

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    (async () => {
      try {
        const [profileRes, ordersRes] = await Promise.all([
          api.get("/api/user/profile"),
          api.post("/api/order/userorders?page=1&limit=5"),
        ]);
        if (profileRes.data.success) {
          setProfile(profileRes.data.user);
          setForm({ name: profileRes.data.user.name, phone: profileRes.data.user.phone || "" });
        }
        if (ordersRes.data.success) {
          setOrders(ordersRes.data.data || []);
        }
      } catch {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    })();
  }, [token, api]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    setSaving(true);
    try {
      const res = await api.put("/api/user/profile", {
        name: form.name.trim(),
        phone: form.phone.trim(),
      });
      if (res.data.success) {
        setProfile(res.data.user);
        setUser(res.data.user);
        setEditing(false);
        toast.success("Profile updated");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({ name: profile.name, phone: profile.phone || "" });
    setEditing(false);
  };

  const totalSpent = orders.reduce((sum, o) => sum + (o.amount || 0), 0);

  if (authChecked && !token) {
    return (
      <div className="profile-page">
        <div className="profile-empty">
          <FaUserCircle className="empty-icon" />
          <h2>Login to View Profile</h2>
          <p>Sign in to see your profile details.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="profile-page">
        <h2>My Profile</h2>
        <div className="profile-card-skeleton">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton-row">
              <div className="skeleton-label" />
              <div className="skeleton-value" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-page">
        <div className="profile-empty">
          <h2>Something went wrong</h2>
          <p>Could not load profile information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <h2>My Profile</h2>

      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-header">
            <FaUserCircle className="profile-avatar" />
            <div>
              <h3>{profile.name}</h3>
              <span className="profile-role">{profile.role}</span>
            </div>
          </div>

          <div className="profile-fields">
            <div className="profile-field">
              <label>Email</label>
              <p className="field-value readonly">{profile.email}</p>
            </div>

            <div className="profile-field">
              <label>Name</label>
              {editing ? (
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="field-input"
                />
              ) : (
                <p className="field-value">{profile.name}</p>
              )}
            </div>

            <div className="profile-field">
              <label>Phone</label>
              {editing ? (
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="field-input"
                  placeholder="Enter phone number"
                />
              ) : (
                <p className="field-value">{profile.phone || "—"}</p>
              )}
            </div>

            <div className="profile-field">
              <label>Member since</label>
              <p className="field-value readonly">
                {new Date(profile.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric", month: "long", year: "numeric",
                })}
              </p>
            </div>
          </div>

          <div className="profile-actions">
            {editing ? (
              <>
                <button className="btn secondary" onClick={handleCancel} disabled={saving}>
                  Cancel
                </button>
                <button className="btn primary" onClick={handleSave} disabled={saving}>
                  {saving ? <FaSpinner className="spinner" /> : <FaSave />}
                  {saving ? " Saving..." : " Save Changes"}
                </button>
              </>
            ) : (
              <button className="btn primary" onClick={() => setEditing(true)}>
                Edit Profile
              </button>
            )}
          </div>
        </div>

        <div className="profile-stats">
          <div className="stat-card">
            <FaBoxOpen className="stat-icon" />
            <div>
              <span className="stat-value">{orders.length}</span>
              <span className="stat-label">Total Orders</span>
            </div>
          </div>
          <div className="stat-card">
            <FaRupeeSign className="stat-icon" />
            <div>
              <span className="stat-value">₹{totalSpent.toLocaleString("en-IN")}</span>
              <span className="stat-label">Total Spent</span>
            </div>
          </div>
          <div className="stat-card">
            <FaCalendarAlt className="stat-icon" />
            <div>
              <span className="stat-value">
                {new Date(profile.createdAt).toLocaleDateString("en-IN", {
                  month: "short", year: "numeric",
                })}
              </span>
              <span className="stat-label">Member Since</span>
            </div>
          </div>
        </div>

        <div className="profile-quick-links">
          <h3>Quick Actions</h3>
          <div className="quick-links-grid">
            <Link to="/myorders" className="quick-link-card">
              <FaClipboardList />
              <span>My Orders</span>
              <FaArrowRight className="quick-link-arrow" />
            </Link>
            <Link to="/prescription" className="quick-link-card">
              <FaPrescriptionBottleAlt />
              <span>Upload Prescription</span>
              <FaArrowRight className="quick-link-arrow" />
            </Link>
            <Link to="/" className="quick-link-card">
              <FaShoppingBag />
              <span>Browse Medicines</span>
              <FaArrowRight className="quick-link-arrow" />
            </Link>
            <Link to="/cart" className="quick-link-card">
              <FaShoppingBag />
              <span>View Cart</span>
              <FaArrowRight className="quick-link-arrow" />
            </Link>
          </div>
        </div>

        {orders.length > 0 && (
          <div className="profile-recent-orders">
            <div className="section-header">
              <h3>Recent Orders</h3>
              <Link to="/myorders" className="view-all">
                View All <FaArrowRight />
              </Link>
            </div>
            <div className="recent-orders-list">
              {orders.slice(0, 3).map((order) => (
                  <div className="recent-order-row" key={order._id}>
                  <FaBoxOpen className="order-icon" />
                  <div className="order-info">
                    <p className="order-items">
                      {order.items.map((item, i) => (
                        <span key={i}>
                          {item.name} x {item.quantity}{i !== order.items.length - 1 ? ", " : ""}
                        </span>
                      ))}
                    </p>
                    <span className="order-date">
                      {new Date(order.date).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="order-meta">
                    <span className="order-amount">₹{order.amount}</span>
                    <span className="order-status" style={{
                      color: order.status === "Delivered" ? "#22c55e"
                        : order.status === "Cancelled" ? "#ef4444"
                        : order.status === "Out for delivery" ? "#3b82f6"
                        : "#f59e0b"
                    }}>
                      ● {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
