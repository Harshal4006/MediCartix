import React from "react";
import "./Header.css";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <div className="header">
      <div className="header-inner">
        <div className="header-left">
          <h2>Order Medicines Safely And Easily</h2>
          <p>
            Genuine medicines, healthcare devices, and wellness essentials
            delivered to your doorstep with speed, safety, and care.
          </p>

          <div className="header-actions">
            <button
              className="btn primary"
              onClick={() =>
                document
                  .getElementById("medicin-display")
                  .scrollIntoView({ behavior: "smooth" })
              }
            >
              View Menu
            </button>
            <Link to="/prescription" className="btn secondary">
              Upload Prescription
            </Link>
          </div>
        </div>

        <div className="header-right">
          <div className="feature">✔ 100% Genuine Medicines</div>
          <div className="feature">✔ Licensed Pharmacy</div>
          <div className="feature">✔ Fast & Secure Delivery</div>
          <div className="feature">✔ Easy Returns & Support</div>
        </div>
      </div>
    </div>
  );
};

export default Header;
