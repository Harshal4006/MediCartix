import React from "react";
import "./WhyUs.css";

const WhyUs = () => {
  return (
    <section className="whyus" id="whyus">
      <div className="whyus-container">
        <h2>Why Choose MediCartix?</h2>
        <p className="subtitle">
          Your trusted partner for safe and fast medicine delivery.
        </p>

        <div className="whyus-grid">

          <div className="whyus-card">
            <div className="icon">💊</div>
            <h3>100% Genuine Medicines</h3>
            <p>All products are verified and quality checked.</p>
          </div>

          <div className="whyus-card">
            <div className="icon">🚚</div>
            <h3>Fast & Reliable Delivery</h3>
            <p>Quick doorstep delivery service.</p>
          </div>

          <div className="whyus-card">
            <div className="icon">🔒</div>
            <h3>Secure Payment Gateway</h3>
            <p>Your transactions are encrypted and safe.</p>
          </div>

          <div className="whyus-card">
            <div className="icon">👨‍⚕️</div>
            <h3>Certified Pharmacist Support</h3>
            <p>Expert assistance whenever needed.</p>
          </div>

          <div className="whyus-card">
            <div className="icon">📦</div>
            <h3>Easy Returns</h3>
            <p>Hassle-free return process for eligible products.</p>
          </div>

          <div className="whyus-card">
            <div className="icon">📲</div>
            <h3>24/7 Customer Support</h3>
            <p>We are available anytime to help you.</p>
          </div>

        </div>
      </div>
    </section>
  );
};

export default WhyUs;