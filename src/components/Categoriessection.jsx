import React from "react";
import { FaStar, FaHeart, FaShoppingCart } from "react-icons/fa";
import { addToCart } from "../app/cartSlice";
import { useDispatch } from "react-redux";

const Categoriessection = ({ categories = [], products = [] }) => {
  const dispatch = useDispatch();

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

  const handleAddToCart = (product) => {
    dispatch(addToCart(product)); // Dispatch the product to Redux store
  };

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

          return (
            <div key={category._id} className="category-section">
              <div className="category-header">
                <h3 className="category-title">{category.name}</h3>
                <button className="view-all-btn">View All</button>
              </div>

              <div className="products-grid">
                {catProducts.map((product) => {
                  const rating = Number(product.rating ?? 4);

                  return (
                    <div key={product._id} className="product-card">
                      <div className="product-image">
                        <img
                          src={product.image || "https://via.placeholder.com/300"}
                          alt={product.name}
                        />
                        <button className="wishlist-btn">
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

                        <button
                          className="add-to-cart-btn"
                          onClick={() => handleAddToCart(product)}
                        >
                          <FaShoppingCart className="cart-icon" />
                          Add to Cart
                        </button>
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

export default Categoriessection;
