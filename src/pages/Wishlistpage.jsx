import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { FaShoppingCart, FaHeart } from "react-icons/fa";
import { removeFromWishlist } from "../app/wishlistSlice";
import { addToCart } from "../app/cartSlice";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Wishlistpage = () => {
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const dispatch = useDispatch();

  const handleRemove = (id) => {
    dispatch(removeFromWishlist(id));
  };

  const handleAddToCart = (product) => {
    dispatch(addToCart(product));
  };

  return (
    <div>
      <Navbar />
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h2>Your Wishlist</h2>
        {wishlistItems.length === 0 ? (
          <p>Your wishlist is empty.</p>
        ) : (
          <div className="products-grid">
            {wishlistItems.map((product) => (
              <div key={product._id} className="product-card">
                <div className="product-image">
                  <img
                    src={product.image || "https://via.placeholder.com/300"}
                    alt={product.name}
                  />
                  <button
                    className="wishlist-btn"
                    onClick={() => handleRemove(product._id)}
                    style={{ color: "red", cursor: "pointer" }}
                  >
                    <FaHeart />
                  </button>
                </div>

                <div className="product-info">
                  <h4 className="product-name">{product.name}</h4>
                  <div className="product-price">${product.price}</div>
                  <button
                    className="add-to-cart-btn"
                    onClick={() => handleAddToCart(product)}
                  >
                    <FaShoppingCart className="cart-icon" />
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Wishlistpage;
