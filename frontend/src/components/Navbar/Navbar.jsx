import React, { useContext, useState, useRef, useEffect } from "react";
import "./Navbar.css";
import { FiMenu, FiSearch, FiX } from "react-icons/fi";
import { HiOutlineShoppingBag } from "react-icons/hi";
import { FaUserCircle } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";

export const Navbar = ({ setShowLogin, setSearch }) => {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState("home");
  const [showProfile, setShowProfile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const profileRef = useRef();

  const { getTotalCartItems, token, setToken, user } = useContext(StoreContext);

  useEffect(() => {
    const path = location.pathname;
    if (path === "/") setActiveSection("home");
    else if (path === "/cart") setActiveSection("cart");
    else if (path === "/myorders") setActiveSection("orders");
    else if (path === "/prescription") setActiveSection("prescription");
  }, [location.pathname]);

  const logout = () => {
    setToken("");
    setShowProfile(false);
  };

  const closeOverlays = () => {
    setShowProfile(false);
    setShowSearch(false);
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

  const handleSearch = (e) => {
    setSearchInput(e.target.value);
    if (setSearch) {
      setSearch(e.target.value);
    }
  };

  return (
    <div className="navbar-wrapper">
      <div className="navbar">
        <Link to="/">
          <h1 className="navbar-brand">MediCartix</h1>
        </Link>

        <ul className="navbar-menu">
          <Link to="/" onClick={() => setActiveSection("home")} className={activeSection === "home" ? "active" : ""}>Home</Link>
          <a href="#explore-menu" onClick={() => setActiveSection("menu")} className={activeSection === "menu" ? "active" : ""}>Menu</a>
          <a href="#whyus" onClick={() => setActiveSection("WhyUs")} className={activeSection === "WhyUs" ? "active" : ""}>Why Us</a>
          <a href="#footer" onClick={() => setActiveSection("contact-us")} className={activeSection === "contact-us" ? "active" : ""}>Contact</a>
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

          <div className="nav-icon" onClick={() => setShowSearch(!showSearch)} aria-label="Toggle search">
            <FiSearch />
          </div>

          <div className="nav-icon navbar-search-icon">
            <Link to="/cart" aria-label="View cart">
              <HiOutlineShoppingBag />
            </Link>
            {getTotalCartItems() > 0 && (
              <div className="cart-count">{getTotalCartItems()}</div>
            )}
          </div>

          {!token ? (
            <button className="Sign" onClick={() => setShowLogin(true)}>
              Sign In
            </button>
          ) : (
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
                  <li onClick={() => { logout(); closeOverlays(); }}>
                    Logout
                  </li>
                </ul>
              )}
            </div>
          )}
        </div>
      </div>

      {showMobileMenu && (
        <div className="navbar-mobile-overlay" onClick={() => setShowMobileMenu(false)}>
          <div id="navbar-mobile-menu" className="navbar-mobile-menu" onClick={(e) => e.stopPropagation()}>
            <Link to="/" onClick={() => { setActiveSection("home"); closeOverlays(); }} className={activeSection === "home" ? "active" : ""}>Home</Link>
            <a href="#explore-menu" onClick={() => { setActiveSection("menu"); closeOverlays(); }} className={activeSection === "menu" ? "active" : ""}>Menu</a>
            <a href="#whyus" onClick={() => { setActiveSection("WhyUs"); closeOverlays(); }} className={activeSection === "WhyUs" ? "active" : ""}>Why Us</a>
            <Link to="/prescription" onClick={closeOverlays}>Upload Prescription</Link>
            <Link to="/cart" onClick={closeOverlays}>Cart</Link>
            <a href="#footer" onClick={() => { setActiveSection("contact-us"); closeOverlays(); }} className={activeSection === "contact-us" ? "active" : ""}>Contact</a>
          </div>
        </div>
      )}

      {showSearch && (
        <div className="navbar-search-box">
          <input
            type="text"
            placeholder="Search medicines..."
            value={searchInput}
            onChange={handleSearch}
            autoFocus
          />
        </div>
      )}
    </div>
  );
};
