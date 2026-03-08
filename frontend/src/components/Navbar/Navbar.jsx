import React, { useContext, useState, useRef, useEffect } from "react";
import "./Navbar.css";
import { FiSearch } from "react-icons/fi";
import { HiOutlineShoppingBag } from "react-icons/hi";
import { FaUserCircle } from "react-icons/fa";
import { Link } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";

export const Navbar = ({ setShowLogin, setSearch }) => {

  const [menu, setMenu] = useState("home");
  const [showProfile, setShowProfile] = useState(false);

  // SEARCH STATES
  const [showSearch, setShowSearch] = useState(false);
  const [searchInput, setSearchInput] = useState("");

  const profileRef = useRef();

  const {
    getTotalCartItems,
    token,
    setToken
  } = useContext(StoreContext);

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // HANDLE SEARCH INPUT
  const handleSearch = (e) => {
    setSearchInput(e.target.value);
    if(setSearch){
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

          <Link
            to="/"
            onClick={() => setMenu("home")}
            className={menu === "home" ? "active" : ""}
          >
            Home
          </Link>

          <a
            href="#explore-menu"
            onClick={() => setMenu("menu")}
            className={menu === "menu" ? "active" : ""}
          >
            Menu
          </a>

          <a
            href="#whyus"
            onClick={() => setMenu("WhyUs")}
            className={menu === "WhyUs" ? "active" : ""}
          >
            Why-Us
          </a>

          <a
            href="#footer"
            onClick={() => setMenu("contact-us")}
            className={menu === "contact-us" ? "active" : ""}
          >
            Contact Us
          </a>

        </ul>

        <div className="navbar-right">

          <div 
            className="nav-icon"
            onClick={() => setShowSearch(!showSearch)}
          >
            <FiSearch />
          </div>

          <div className="nav-icon navbar-search-icon">
            <Link to="/cart">
              <HiOutlineShoppingBag />
            </Link>

            {getTotalCartItems() > 0 && (
              <div className="cart-count">
                {getTotalCartItems()}
              </div>
            )}
          </div>

          {!token ? (
            <button
              className="Sign"
              onClick={() => setShowLogin(true)}
            >
              Sign In
            </button>
          ) : (
            <div className="navbar-profile" ref={profileRef}>

              <FaUserCircle
                className="profile-icon"
                onClick={() => setShowProfile(!showProfile)}
              />

              {showProfile && (
                <ul className="nav-profile-dropdown">

                  <li>
                    <Link
                      to="/myorders"
                      onClick={() => setShowProfile(false)}
                    >
                      My Orders
                    </Link>
                  </li>

                  <li
                    onClick={() => {
                      logout();
                      setShowProfile(false);
                    }}
                  >
                    Logout
                  </li>

                </ul>
              )}

            </div>
          )}

        </div>

      </div>

      {showSearch && (
        <div className="navbar-search-box">
          <input
            type="text"
            placeholder="Search medicines..."
            value={searchInput}
            onChange={handleSearch}
          />
        </div>
      )}

    </div>
  );
};