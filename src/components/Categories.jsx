import React, { useEffect, useState, useRef } from "react";
import { FaStar, FaHeart, FaShoppingCart } from "react-icons/fa";
import { addToCart, updateQuantity, optimisticUpdateQty, rollbackCart } from "../app/cartSlice";
import { addToWishlist, removeFromWishlist } from "../app/wishlistSlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";


const Categories = ({ categories = [], products = [] }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState({});

  const searchParams = new URLSearchParams(location.search);
  const categoryIdInURL = searchParams.get("category");

  const wishlistItems = useSelector((state) => state.wishlist.items);
  const cartItems = useSelector((state) => state.cart.items); // Get cart items

  // Store debounce timers for each product
  const debounceTimers = useRef({});

  useEffect(() => {
    if (products.length > 0 || categories.length > 0) {
      setLoading(false);
    }
  }, [products, categories]);

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <FaStar
        key={index}
        className={index < Math.floor(rating) ? "star filled" : "star"}
      />
    ));
  };

  const getProductsByCategory = (categoryId) =>
    products.filter((p) => p.category && p.category._id === categoryId);

  // Check if product is in cart and get its quantity
  const getCartItem = (productId) => {
    return cartItems.find((item) => item._id === productId);
  };

  // Amazon-style: Unified add to cart
  const handleAddToCart = async (product) => {
    setAddingToCart(prev => ({ ...prev, [product._id]: true }));

    try {
      await dispatch(addToCart(product)).unwrap();
      toast.success(`${product.name} added to cart!`, {
        position: "bottom-right",
        autoClose: 2000,
      });
    } catch (error) {
      toast.error("Failed to add to cart");
    } finally {
      setAddingToCart(prev => ({ ...prev, [product._id]: false }));
    }
  };

  // Debounced increase (same logic as Cart.jsx)
  const handleIncrease = (item) => {
    const previousCart = [...cartItems];
    const newQuantity = item.quantity + 1;

    // STEP 1: Immediate optimistic update
    dispatch(optimisticUpdateQty({ productId: item._id, quantity: newQuantity }));

    // STEP 2: Clear any existing timer for this product
    if (debounceTimers.current[item._id]) {
      clearTimeout(debounceTimers.current[item._id]);
    }

    // STEP 3: Set new timer to update backend after user stops clicking
    debounceTimers.current[item._id] = setTimeout(async () => {
      try {
        await dispatch(updateQuantity({ 
          productId: item._id, 
          quantity: newQuantity 
        })).unwrap();
      } catch (error) {
        dispatch(rollbackCart(previousCart));
        toast.error("Failed to update quantity");
      }
    }, 500);
  };

  // Debounced decrease (same logic as Cart.jsx)
  const handleDecrease = (item) => {
    if (item.quantity <= 1) return;

    const previousCart = [...cartItems];
    const newQuantity = item.quantity - 1;

    // STEP 1: Immediate optimistic update
    dispatch(optimisticUpdateQty({ productId: item._id, quantity: newQuantity }));

    // STEP 2: Clear existing timer
    if (debounceTimers.current[item._id]) {
      clearTimeout(debounceTimers.current[item._id]);
    }

    // STEP 3: Set new timer for backend update
    debounceTimers.current[item._id] = setTimeout(async () => {
      try {
        await dispatch(updateQuantity({ 
          productId: item._id, 
          quantity: newQuantity 
        })).unwrap();
      } catch (error) {
        dispatch(rollbackCart(previousCart));
        toast.error("Failed to update quantity");
      }
    }, 500);
  };

  const handleWishlist = (product) => {
    const exists = wishlistItems.find((item) => item._id === product._id);
    if (exists) {
      dispatch(removeFromWishlist(product._id));
      toast.info("Removed from wishlist");
    } else {
      dispatch(addToWishlist(product));
      toast.success("Added to wishlist");
    }
  };

  const handleViewAll = (categoryId) => {
    if (categoryIdInURL === categoryId) {
      navigate("/");
    } else {
      navigate(`/search?category=${categoryId}`);
    }
  };

  /* ================= LOADING UI ================= */
  if (loading) {
    return (
      <section className="categories-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Shop by Category</h2>
            <p className="section-subtitle">Loading products...</p>
          </div>

          {[...Array(2)].map((_, idx) => (
            <div key={idx} className="category-section">
              <div className="category-header">
                <div className="skeleton skeleton-title"></div>
                <div className="skeleton skeleton-btn"></div>
              </div>

              <div className="products-grid">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="product-card skeleton-card">
                    <div className="skeleton skeleton-img"></div>
                    <div className="product-info">
                      <div className="skeleton skeleton-text"></div>
                      <div className="skeleton skeleton-text small"></div>
                      <div className="skeleton skeleton-btn full"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  /* ================= NORMAL UI ================= */
  return (
    <section className="categories-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Shop by Category</h2>
          <p className="section-subtitle">
            Discover our curated collection of premium products
          </p>
        </div>

        {categories.map((category) => {
          const catProducts = getProductsByCategory(category._id);
          if (catProducts.length === 0) return null;

          const displayedProducts = catProducts.slice(0, 4);

          return (
            <div key={category._id} className="category-section">
              <div className="category-header">
                <h3 className="category-title">{category.name}</h3>
                <button
                  className="view-all-btn"
                  onClick={() => handleViewAll(category._id)}
                >
                  {categoryIdInURL === category._id
                    ? "Return Home"
                    : "View All"}
                </button>
              </div>

              <div className="products-grid">
                {displayedProducts.map((product) => {
                  const rating = Number(product.rating ?? 4);
                  const inWishlist = wishlistItems.find(
                    (item) => item._id === product._id
                  );
                  const isAdding = addingToCart[product._id];
                  const cartItem = getCartItem(product._id); // Check if in cart

                  return (
                    <div key={product._id} className="product-card">
                      <div className="product-image">
                        <img
                          src={product.image || "https://via.placeholder.com/300"}
                          alt={product.name}
                        />
                        <button
                          className="wishlist-btn"
                          onClick={() => handleWishlist(product)}
                          style={{
                            color: inWishlist ? "red" : "grey",
                          }}
                        >
                          <FaHeart />
                        </button>
                        <div className="product-badge">Hot</div>
                      </div>

                      <div className="product-info">
                        <h4 className="product-name">{product.name}</h4>

                        <div className="product-rating">
                          <div className="stars">{renderStars(rating)}</div>
                          <span className="rating-value">({rating})</span>
                        </div>

                        <div className="product-price">${product.price}</div>

                        {/* CONDITIONAL RENDERING: Show quantity controls if in cart, otherwise show Add to Cart button */}
                        {cartItem ? (
                          <div className="category-qty-controls">
                            <button 
                              onClick={() => handleDecrease(cartItem)}
                              disabled={cartItem.quantity <= 1}
                              className="qty-btn"
                            >
                              −
                            </button>
                            <span className="qty-display">{cartItem.quantity}</span>
                            <button 
                              onClick={() => handleIncrease(cartItem)}
                              className="qty-btn"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <button
                            className="add-to-cart-btn"
                            onClick={() => handleAddToCart(product)}
                            disabled={isAdding}
                          >
                            <FaShoppingCart className="cart-icon" />
                            {isAdding ? "Adding..." : "Add to Cart"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Categories;