import React, { useState, useContext } from "react";
import "./Prescription.css";
import { StoreContext } from "../../context/StoreContext";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const Prescription = () => {
  const { api, token } = useContext(StoreContext);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowed.includes(selected.type)) {
      toast.error("Please upload a PDF or image (JPEG, PNG)");
      e.target.value = "";
      return;
    }

    if (selected.size > 10 * 1024 * 1024) {
      toast.error("File size must be under 10MB");
      e.target.value = "";
      return;
    }

    setFile(selected);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a prescription file");
      return;
    }

    if (!token) {
      toast.error("Please login to upload a prescription");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("prescription", file);

      const response = await api.post("/api/prescription/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        toast.success("Prescription uploaded successfully!");
        setFile(null);
        document.getElementById("fileUpload").value = "";
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Upload failed");
    }

    setUploading(false);
  };

  return (
    <div className="prescription-page">
      <h2>Upload Your Prescription</h2>
      <p>Upload a doctor's prescription and we will help you find the medicines.</p>

      {!token ? (
        <div className="upload-login-prompt">
          <p>Please login to upload a prescription.</p>
          <Link to="/" className="btn primary">Go to Home</Link>
        </div>
      ) : (
        <>
          <div className="upload-box">
            <input
              type="file"
              id="fileUpload"
              onChange={handleFileChange}
              hidden
              accept=".pdf,image/jpeg,image/png,image/webp"
            />
            <label htmlFor="fileUpload" className="upload-btn">
              {file ? "Change File" : "Choose Prescription"}
            </label>
            {file && (
              <div className="file-info">
                <p className="file-name">{file.name}</p>
                <p className="file-size">
                  {(file.size / (1024 * 1024)).toFixed(1)} MB
                </p>
              </div>
            )}
          </div>

          <button
            className="submit-btn"
            onClick={handleUpload}
            disabled={!file || uploading}
          >
            {uploading ? "Uploading..." : "Upload Prescription"}
          </button>
        </>
      )}
    </div>
  );
};

export default Prescription;
