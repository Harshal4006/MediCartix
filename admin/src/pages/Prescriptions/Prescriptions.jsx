import React, { useEffect, useState } from "react";
import "./Prescriptions.css";
import axios from "axios";
import { toast } from "react-toastify";
import { MdVisibility, MdCheckCircle, MdCancel } from "react-icons/md";

const Prescriptions = () => {
  const url = import.meta.env.VITE_API_URL || "http://localhost:4000";
  const token = localStorage.getItem("adminToken");

  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  const fetchPrescriptions = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const params = filter ? `?status=${filter}` : "";
      const res = await axios.get(`${url}/api/prescription/list${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        setPrescriptions(res.data.data);
      }
    } catch {
      toast.error("Failed to load prescriptions");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const res = await axios.post(
        `${url}/api/prescription/status`,
        { id, status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        toast.success(`Prescription ${status}`);
        fetchPrescriptions();
      }
    } catch {
      toast.error("Failed to update");
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, [filter]);

  const statusColors = {
    pending: "#f59e0b",
    approved: "#22c55e",
    rejected: "#ef4444",
    fulfilled: "#3b82f6",
  };

  return (
    <div className="prescriptions-admin">
      <div className="prescriptions-header">
        <h2>Prescriptions {prescriptions.length > 0 && `(${prescriptions.length})`}</h2>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="fulfilled">Fulfilled</option>
        </select>
      </div>

      {loading ? (
        <p className="loading-text">Loading...</p>
      ) : prescriptions.length === 0 ? (
        <p className="loading-text">No prescriptions found.</p>
      ) : (
        <div className="prescriptions-list">
          {prescriptions.map((p) => (
            <div key={p._id} className="prescription-card">
              <div className="prescription-top">
                <span className="prescription-user">
                  {p.userId?.name || "Unknown"} ({p.userId?.email || "—"})
                </span>
                <span
                  className="prescription-status"
                  style={{ color: statusColors[p.status] }}
                >
                  ● {p.status}
                </span>
              </div>

              <div className="prescription-file-info">
                <span>{p.originalName}</span>
                <span>{(p.fileSize / (1024 * 1024)).toFixed(1)} MB</span>
                <span>{new Date(p.createdAt).toLocaleDateString()}</span>
              </div>

              {p.adminNote && (
                <p className="prescription-note">Note: {p.adminNote}</p>
              )}

              <div className="prescription-actions">
                <a
                  href={`${url}/uploads/prescriptions/${p.fileName}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="action-btn view-btn"
                >
                  <MdVisibility /> View
                </a>

                {p.status === "pending" && (
                  <>
                    <button
                      className="action-btn approve-btn"
                      onClick={() => updateStatus(p._id, "approved")}
                    >
                      <MdCheckCircle /> Approve
                    </button>
                    <button
                      className="action-btn reject-btn"
                      onClick={() => updateStatus(p._id, "rejected")}
                    >
                      <MdCancel /> Reject
                    </button>
                  </>
                )}

                {p.status === "approved" && (
                  <button
                    className="action-btn fulfill-btn"
                    onClick={() => updateStatus(p._id, "fulfilled")}
                  >
                    <MdCheckCircle /> Mark Fulfilled
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Prescriptions;
