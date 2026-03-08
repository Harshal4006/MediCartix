import React from "react";
import "./Navbar.css";
import { FiBell } from "react-icons/fi";
import { FaUserCircle } from "react-icons/fa";

const Navbar = () => {
  return (
    <div className="admin-navbar">

      <h1 className="admin-logo">
        Medi<span>Cartix</span>
      </h1>


      <div className="admin-navbar-right">

        <div className="nav-icon">
          <FiBell />
          <span className="notification-dot"></span>
        </div>

        <div className="admin-profile">
          <FaUserCircle className="profile-icon" />
          <div className="profile-text">
            <p className="admin-name">Admin</p>
            <span className="admin-role">Super Admin</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Navbar;