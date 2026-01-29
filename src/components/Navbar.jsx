import React, { useContext, useEffect, useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartShopping, faMagnifyingGlass, faTimes } from "@fortawesome/free-solid-svg-icons";
import { faUser } from "@fortawesome/free-regular-svg-icons";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "./UserContext";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { FaHeart } from "react-icons/fa";
import API_URL from "../config";

const Navbar = () => {
  const { isLoggedIn, logout } = useContext(UserContext);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const wrapperRef = useRef(null);
  const searchInputRef = useRef(null);

  const cartItems = useSelector((state) => state.cart.items);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!search.trim()) return;
    navigate(`/search?q=${search}`);
    setSearch("");
    setSuggestions([]);
    setMenuOpen(false);
    setSearchOpen(false);
  };

  const handleChange = async (e) => {
    setSearch(e.target.value);
    if (!e.target.value.trim()) return setSuggestions([]);

    try {
      const res = await axios.get(`${API_URL}/api/products`);
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
      // Check if clicking the mobile search toggle button or inside mobile search overlay
      const isMobileSearchToggle = event.target.closest('.mobile-search-toggle');
      const isMobileSearchOverlay = event.target.closest('.mobile-search-overlay');
      
      // Don't close if clicking the mobile search toggle or inside the overlay
      if (isMobileSearchToggle || isMobileSearchOverlay) {
        return;
      }
      
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setSuggestions([]);
        // Close mobile search if clicking outside
        if (window.innerWidth <= 576) {
          setSearchOpen(false);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close menu when clicking outside or on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && menuOpen) {
        setMenuOpen(false);
      }
      // Close mobile search on resize
      if (window.innerWidth > 576 && searchOpen) {
        setSearchOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [menuOpen, searchOpen]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [menuOpen]);

  // Focus search input when mobile search opens
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  const handleLogout = () => {
    logout();
    navigate("/");
    setMenuOpen(false);
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    // Close search when opening menu
    if (!menuOpen) {
      setSearchOpen(false);
    }
  };

  const toggleSearch = (e) => {
    e.stopPropagation(); // Prevent event bubbling
    setSearchOpen(!searchOpen);
    // Close menu when opening search
    if (!searchOpen) {
      setMenuOpen(false);
    }
  };

  const handleLinkClick = () => {
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to="/" onClick={handleLinkClick}>
            <span className="company-name">NovaNest</span>
          </Link>
        </div>

        {/* Desktop & Tablet Search (inline) - Hidden on mobile ≤576px */}
        <div className="navbar-search-wrapper desktop-search" ref={wrapperRef}>
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
                    setMenuOpen(false);
                  }}
                >
                  {item.name} ({item.category?.name})
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mobile Search Icon - Shows only on ≤576px */}
        <button 
          className="mobile-search-toggle"
          onClick={toggleSearch}
          aria-label="Toggle search"
        >
          <FontAwesomeIcon icon={searchOpen ? faTimes : faMagnifyingGlass} />
        </button>

        {/* Mobile Search Overlay - Shows only on ≤576px when active */}
        {searchOpen && (
          <div 
            className="mobile-search-overlay" 
            onClick={(e) => {
              // Only close if clicking the overlay itself, not its children
              if (e.target.classList.contains('mobile-search-overlay')) {
                setSearchOpen(false);
              }
            }}
          >
            <div className="mobile-search-container">
              {/* Close button */}
              <button 
                className="mobile-search-close"
                onClick={() => setSearchOpen(false)}
                aria-label="Close search"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>

              <form className="navbar-search" onSubmit={handleSearch}>
                <input
                  ref={searchInputRef}
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
                        setSearchOpen(false);
                      }}
                    >
                      {item.name} ({item.category?.name})
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Hamburger Menu Button */}
        <button 
          className={`hamburger ${menuOpen ? 'active' : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <ul className={`navbar-menu ${menuOpen ? 'active' : ''}`}>
          <li className="navbar-item">
            {isLoggedIn ? (
              <>
                <Link to="/profile" className="navbar-link" onClick={handleLinkClick}>
                  <FontAwesomeIcon icon={faUser} /> Account
                </Link>
                <button onClick={handleLogout} className="navbar-link logout-btn">
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="navbar-link" onClick={handleLinkClick}>
                <FontAwesomeIcon icon={faUser} /> Login
              </Link>
            )}
          </li>

          <li className="navbar-item">
            <Link to="/cart" className="navbar-link cart-link" onClick={handleLinkClick}>
              <span className="cart-icon-wrapper">
                <FontAwesomeIcon icon={faCartShopping} className="cart-icon" />
                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </span>
              Cart
            </Link>
          </li>

          <li className="navbar-item">
            <Link to="/wishlist" className="navbar-link" onClick={handleLinkClick}>
              <FaHeart /> Wishlist
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;