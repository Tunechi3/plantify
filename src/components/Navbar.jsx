import React, { useContext, useEffect, useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartShopping, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { faUser } from "@fortawesome/free-regular-svg-icons";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "./UserContext";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { FaHeart } from "react-icons/fa";

const Navbar = () => {
  const { isLoggedIn, logout } = useContext(UserContext);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const wrapperRef = useRef(null);

  const cartItems = useSelector((state) => state.cart.items);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!search.trim()) return;
    navigate(`/search?q=${search}`);
    setSearch("");
    setSuggestions([]);
  };

  const handleChange = async (e) => {
    setSearch(e.target.value);
    if (!e.target.value.trim()) return setSuggestions([]);

    try {
      const res = await axios.get("http://localhost:3000/api/products");
      const filtered = res.data.filter(
        (p) =>
          p.name.toLowerCase().includes(e.target.value.toLowerCase()) ||
          p.category?.name.toLowerCase().includes(e.target.value.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5));
    } catch (err) {
      console.error(err);
    }
  };

  // Close suggestions dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to="/">
            <span className="company-name">NovaNest</span>
          </Link>
        </div>

        <div className="navbar-search-wrapper" ref={wrapperRef}>
          <form className="navbar-search" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={handleChange}
            />
            <button type="submit">
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </button>
          </form>

          {suggestions.length > 0 && (
            <div className="suggestions-dropdown">
              {suggestions.map((item) => (
                <div
                  key={item._id}
                  className="suggestion-item"
                  onClick={() => {
                    navigate(`/search?q=${item.name}`);
                    setSearch("");
                    setSuggestions([]);
                  }}
                >
                  {item.name} ({item.category?.name})
                </div>
              ))}
            </div>
          )}
        </div>

        <ul className="navbar-menu">
          <li className="navbar-item">
            {isLoggedIn ? (
              <>
                <Link to="/profile" className="navbar-link">
                  <FontAwesomeIcon icon={faUser} /> Account
                </Link>
                <button onClick={handleLogout} className="navbar-link logout-btn">
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="navbar-link">
                <FontAwesomeIcon icon={faUser} /> Login
              </Link>
            )}
          </li>

          <li className="navbar-item">
            <Link to="/cart" className="navbar-link cart-link">
              <span className="cart-icon-wrapper">
                <FontAwesomeIcon icon={faCartShopping} className="cart-icon" />
                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </span>
              Cart
            </Link>
          </li>

          <li className="navbar-item">
            <Link to="/wishlist" className="navbar-link">
              <FaHeart /> Wishlist
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;