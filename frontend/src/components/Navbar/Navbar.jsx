import React, { useContext, useState, useRef, useEffect } from "react";
import "./Navbar.css";
import { FiMenu, FiX } from "react-icons/fi";
import { HiOutlineShoppingBag } from "react-icons/hi";
import { FaUserCircle } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";

const sectionFromPath = (path) => {
  if (path === "/") return "home";
  if (path === "/medicines") return "medicines";
  if (path === "/cart") return "cart";
  if (path === "/myorders") return "orders";
  if (path === "/prescription") return "prescription";
  return "home";
};

export const Navbar = ({ setShowLogin }) => {
  const location = useLocation();
  const activeSection = sectionFromPath(location.pathname);
  const [showProfile, setShowProfile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const profileRef = useRef();

  const { getTotalCartItems, token, logout, user, authChecked } = useContext(StoreContext);

  const handleLogout = () => {
    logout();
    setShowProfile(false);
  };

  const closeOverlays = () => {
    setShowProfile(false);
    setShowMobileMenu(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="navbar-wrapper">
      <div className="navbar">
        <Link to="/">
          <h1 className="navbar-brand">MediCartix</h1>
        </Link>

        <ul className="navbar-menu">
          <Link to="/" className={activeSection === "home" ? "active" : ""}>Home</Link>
          <a href="#explore-menu" className={activeSection === "menu" ? "active" : ""}>Menu</a>
          <Link to="/medicines" className={activeSection === "medicines" ? "active" : ""}>All Medicines</Link>
          <a href="#footer" className={activeSection === "contact-us" ? "active" : ""}>Contact</a>
        </ul>

        <div className="navbar-right">
          <button
            type="button"
            className="navbar-mobile-toggle"
            aria-controls="navbar-mobile-menu"
            aria-expanded={showMobileMenu}
            aria-label={showMobileMenu ? "Close menu" : "Open menu"}
            onClick={() => setShowMobileMenu((prev) => !prev)}
          >
            {showMobileMenu ? <FiX /> : <FiMenu />}
          </button>

          <div className="nav-icon navbar-cart-icon">
            <Link to="/cart" aria-label="View cart">
              <HiOutlineShoppingBag />
            </Link>
            {getTotalCartItems() > 0 && (
              <div className="cart-count">{getTotalCartItems()}</div>
            )}
          </div>

          {!token && authChecked ? (
            <button className="Sign" onClick={() => setShowLogin(true)}>
              Sign In
            </button>
          ) : null}
          {token ? (
            <div className="navbar-profile" ref={profileRef}>
              <FaUserCircle className="profile-icon" onClick={() => setShowProfile(!showProfile)} />
              {user && <span className="profile-name">{user.name?.split(" ")[0]}</span>}

              {showProfile && (
                <ul className="nav-profile-dropdown">
                  <li>
                    <Link to="/myorders" onClick={closeOverlays}>
                      My Orders
                    </Link>
                  </li>
                  <li>
                    <Link to="/prescription" onClick={closeOverlays}>
                      My Prescriptions
                    </Link>
                  </li>
                  <li>
                    <Link to="/profile" onClick={closeOverlays}>
                      My Profile
                    </Link>
                  </li>
                  <li onClick={() => { handleLogout(); closeOverlays(); }}>
                    Logout
                  </li>
                </ul>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {showMobileMenu && (
        <div className="navbar-mobile-overlay" onClick={() => setShowMobileMenu(false)}>
          <div id="navbar-mobile-menu" className="navbar-mobile-menu" onClick={(e) => e.stopPropagation()}>
            <Link to="/" onClick={closeOverlays} className={activeSection === "home" ? "active" : ""}>Home</Link>
            <a href="#explore-menu" onClick={closeOverlays} className={activeSection === "menu" ? "active" : ""}>Menu</a>
            <Link to="/medicines" onClick={closeOverlays} className={activeSection === "medicines" ? "active" : ""}>All Medicines</Link>
            <Link to="/prescription" onClick={closeOverlays}>Upload Prescription</Link>
            <Link to="/cart" onClick={closeOverlays}>Cart</Link>
            <a href="#footer" onClick={closeOverlays} className={activeSection === "contact-us" ? "active" : ""}>Contact</a>
          </div>
        </div>
      )}

    </div>
  );
};
