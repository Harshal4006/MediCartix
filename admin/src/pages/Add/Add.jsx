import React, { useState } from "react";
import "./Add.css";
import axios from "axios";
import { toast } from "react-toastify";
import { FiUploadCloud } from "react-icons/fi";


const Add = () => {

  const url = "http://localhost:4000";

  const [image, setImage] = useState(false);
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Prescription Medicines"
  });

  const onChangeHandler = (e) => {
    setData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const imageHandler = (e) => {
    const file = e.target.files[0];

    if (!file || !file.type.startsWith("image/")) {
      toast.error("Upload image only");
      return;
    }

    setImage(file);
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("name", data.name);
      formData.append("description", data.description);
      formData.append("price", Number(data.price));
      formData.append("category", data.category);
      formData.append("image", image);

      const response = await axios.post(
        `${url}/api/medicine/add`,
        formData
      );

      if (response.data.success) {
        toast.success("Medicine Added ✅");

        setData({
          name: "",
          description: "",
          price: "",
          category: "Prescription Medicines"
        });

        setImage(false);
      }

    } catch (err) {
      toast.error("Server Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add">

      <form className="add-form" onSubmit={onSubmitHandler}>

        <div className="add-img-upload">
          <p className="form-title">Upload Image</p>

          <label htmlFor="image" className="upload-box">

            {image ? (
              <img src={URL.createObjectURL(image)} alt="" />
            ) : (
              <div className="upload-icon">
                <FiUploadCloud size={50} />
                <p>Click to Upload</p>
              </div>
            )}

          </label>

          <input
            type="file"
            id="image"
            hidden
            required
            onChange={imageHandler}
          />
        </div>

        <div className="form-group">
          <p className="form-title">Product Name</p>
          <input
            type="text"
            name="name"
            value={data.name}
            onChange={onChangeHandler}
            placeholder="Enter medicine name"
            required
          />
        </div>

        <div className="form-group">
          <p className="form-title">Product Description</p>
          <textarea
            rows="6"
            name="description"
            value={data.description}
            onChange={onChangeHandler}
            placeholder="Write description"
            required
          />
        </div>

        <div className="add-row">

          <div className="form-group">
            <p className="form-title">Category</p>
            <select
              name="category"
              value={data.category}
              onChange={onChangeHandler}
            >
              <option>Prescription Medicines</option>
              <option>OTC Medicines</option>
              <option>Health & Wellness</option>
              <option>First Aid</option>
              <option>Medical Devices</option>
              <option>Personal Care</option>
              <option>Baby Care</option>
              <option>Ayurvedic & Herbal</option>
            </select>
          </div>

          <div className="form-group">
            <p className="form-title">Price</p>
            <input
              type="number"
              name="price"
              value={data.price}
              onChange={onChangeHandler}
              placeholder="₹ 20"
              required
            />
          </div>

        </div>

        <button className="add-btn" disabled={loading}>
          {loading ? "Adding..." : "ADD"}
        </button>

      </form>

    </div>
  );
};

export default Add;