import React, { useContext, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartShopping, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { faUser } from "@fortawesome/free-regular-svg-icons";
import { Link } from "react-router-dom";
import { UserContext } from "./UserContext";
import { useSelector } from "react-redux";

const Navbar = () => {
  const { isLoggedIn, logout } = useContext(UserContext);
  const [search, setSearch] = useState("");

  const cartItems = useSelector((state) => state.cart.items);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!search.trim()) return;

    // 🔜 later you can navigate to /search?q=search
    console.log("Searching for:", search);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">

        {/* Logo */}
        <div className="navbar-logo">
          <span className="company-name">NovaNest</span>
        </div>

        {/* 🔍 SEARCH BAR (replaces categories) */}
        <form className="navbar-search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit">
            <FontAwesomeIcon icon={faMagnifyingGlass} />
          </button>
        </form>

        {/* Right Menu */}
        <ul className="navbar-menu">
          <li className="navbar-item">
            {isLoggedIn ? (
              <>
                <Link to="/profile" className="navbar-link">
                  <FontAwesomeIcon icon={faUser} /> Account
                </Link>
                <button
                  onClick={logout}
                  className="navbar-link"
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    marginLeft: "10px",
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="navbar-link">
                <FontAwesomeIcon icon={faUser} /> Login
              </Link>
            )}
          </li>

          {/* Cart */}
          <li className="navbar-item">
            <Link to="/cart" className="navbar-link cart-link">
              <span className="cart-icon-wrapper">
                <FontAwesomeIcon icon={faCartShopping} className="cart-icon" />
                {cartCount > 0 && (
                  <span className="cart-badge">{cartCount}</span>
                )}
              </span>
              Cart
            </Link>
          </li>
        </ul>

      </div>
    </nav>
  );
};

export default Navbar;
