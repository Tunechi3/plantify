import React, { useContext } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { FaTrash } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import {
  updateQuantity,
  removeFromCart,
  clearCart,
  optimisticUpdateQty,
  optimisticRemove,
  rollbackCart,
} from "../app/cartSlice";
import { Link } from "react-router-dom";
import { UserContext } from "../components/UserContext";
import { toast } from "react-toastify";
import "../Addproduct.css";

const Cart = () => {
  const { isLoggedIn } = useContext(UserContext);
  const dispatch = useDispatch();
  const items = useSelector((state) => state.cart.items);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Amazon-style: Optimistic update with rollback on error
  const handleIncrease = async (item) => {
    const previousCart = [...items];
    const newQuantity = item.quantity + 1;

    // Optimistic update
    dispatch(optimisticUpdateQty({ productId: item._id, quantity: newQuantity }));

    try {
      await dispatch(updateQuantity({ productId: item._id, quantity: newQuantity })).unwrap();
    } catch (error) {
      // Rollback on error
      dispatch(rollbackCart(previousCart));
      toast.error("Failed to update quantity");
    }
  };

  const handleDecrease = async (item) => {
    if (item.quantity <= 1) return;

    const previousCart = [...items];
    const newQuantity = item.quantity - 1;

    // Optimistic update
    dispatch(optimisticUpdateQty({ productId: item._id, quantity: newQuantity }));

    try {
      await dispatch(updateQuantity({ productId: item._id, quantity: newQuantity })).unwrap();
    } catch (error) {
      // Rollback on error
      dispatch(rollbackCart(previousCart));
      toast.error("Failed to update quantity");
    }
  };

  const handleRemove = async (itemId) => {
    const previousCart = [...items];

    // Optimistic update
    dispatch(optimisticRemove(itemId));

    try {
      await dispatch(removeFromCart(itemId)).unwrap();
      toast.success("Item removed from cart");
    } catch (error) {
      // Rollback on error
      dispatch(rollbackCart(previousCart));
      toast.error("Failed to remove item");
    }
  };

  const handleClear = async () => {
    if (!window.confirm("Are you sure you want to clear your cart?")) return;

    const previousCart = [...items];

    try {
      await dispatch(clearCart()).unwrap();
      toast.success("Cart cleared");
    } catch (error) {
      // Rollback on error
      dispatch(rollbackCart(previousCart));
      toast.error("Failed to clear cart");
    }
  };

  if (items.length === 0) {
    return (
      <>
        <Navbar />
        <div className="empty-cart">
          <div className="empty-cart-content">
            <div className="empty-cart-icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added anything yet. Start shopping now!</p>
            <Link to="/" className="empty-cart-btn">Continue Shopping</Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="cart-page">
        <div className="cart-left">
          <h2 className="cart-title">
            Shopping Cart {!isLoggedIn && <span style={{ fontSize: "14px", color: "#666" }}>(Guest)</span>}
          </h2>
          {items.map((item) => (
            <div className="cart-item" key={item._id}>
              <img src={item.image || "https://via.placeholder.com/120"} alt={item.name} />
              <div className="cart-details">
                <h4>{item.name}</h4>
                <p className="price">${item.price}</p>
                <div className="qty-controls">
                  <button 
                    onClick={() => handleDecrease(item)}
                    disabled={item.quantity <= 1}
                  >
                    −
                  </button>
                  <span>{item.quantity}</span>
                  <button onClick={() => handleIncrease(item)}>+</button>
                </div>
              </div>
              <div className="cart-actions">
                <p className="subtotal">${(item.price * item.quantity).toFixed(2)}</p>
                <button className="remove-btn" onClick={() => handleRemove(item._id)}>
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-right">
          <h3>Order Summary</h3>
          <div className="summary-row">
            <span>Items</span>
            <span>{items.length}</span>
          </div>
          <div className="summary-row">
            <span>Subtotal ({items.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>FREE</span>
          </div>
          <hr />
          <div className="summary-row">
            <span><strong>Total</strong></span>
            <span className="summary-total"><strong>${total.toFixed(2)}</strong></span>
          </div>

          {!isLoggedIn && (
            <p style={{ fontSize: "12px", color: "#666", marginTop: "10px", textAlign: "center" }}>
              Sign in to save your cart
            </p>
          )}

          <button className="checkout-btn">Proceed to Checkout</button>
          <button className="clear-btn" onClick={handleClear}>
            Clear Cart
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Cart;