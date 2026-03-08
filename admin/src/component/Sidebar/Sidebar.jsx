import React from "react";
import "./Sidebar.css";
import { NavLink, useNavigate } from "react-router-dom";
import {
  MdAddBox,
  MdListAlt,
  MdShoppingBag,
  MdLogout
} from "react-icons/md";

const Sidebar = () => {

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminToken"); 
    navigate("/login"); 
  };

  return (
    <div className="sidebar">

      <div className="sidebar-menu">

        <NavLink to="/add" className="sidebar-item">
          <MdAddBox />
          <p>Add Item</p>
        </NavLink>

        <NavLink to="/list" className="sidebar-item">
          <MdListAlt />
          <p>List Item</p>
        </NavLink>

        <NavLink to="/orders" className="sidebar-item">
          <MdShoppingBag />
          <p>Orders</p>
        </NavLink>

      </div>

      <div className="sidebar-logout" onClick={handleLogout}>
        <MdLogout />
        <p>Logout</p>
      </div>

    </div>
  );
};

export default Sidebar;