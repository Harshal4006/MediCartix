import React, { useState } from "react";
import "./Prescription.css";

const Prescription = () => {

  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = () => {
    if (!file) {
      alert("Please upload a prescription first");
      return;
    }

    alert("Prescription uploaded successfully!");
  };

  return (
    <div className="prescription-page">

      <h2>Upload Your Prescription</h2>
      <p>Upload a doctor's prescription and we will help you find the medicines.</p>

      <div className="upload-box">

        <input
          type="file"
          id="fileUpload"
          onChange={handleFileChange}
          hidden
        />

        <label htmlFor="fileUpload" className="upload-btn">
          Choose Prescription
        </label>

        {file && (
          <p className="file-name">{file.name}</p>
        )}

      </div>

      <button className="submit-btn" onClick={handleUpload}>
        Upload Prescription
      </button>

    </div>
  );
};

export default Prescription;