import React, { useContext, useRef } from "react";
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
  
  // Store debounce timers for each product
  const debounceTimers = useRef({});

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Debounced increase with optimistic update
  const handleIncrease = (item) => {
    const previousCart = [...items];
    const newQuantity = item.quantity + 1;

    // STEP 1: Immediate optimistic update (instant UI feedback)
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
        // Success! Backend is now synced (no UI update needed)
      } catch (error) {
        // Rollback on error
        dispatch(rollbackCart(previousCart));
        toast.error("Failed to update quantity");
      }
    }, 500); // Wait 500ms after last click
  };

  const handleDecrease = (item) => {
    if (item.quantity <= 1) return;

    const previousCart = [...items];
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
        // Success! Backend synced
      } catch (error) {
        // Rollback on error
        dispatch(rollbackCart(previousCart));
        toast.error("Failed to update quantity");
      }
    }, 500);
  };

  const handleRemove = async (itemId) => {
    const previousCart = [...items];

    // Clear any pending quantity updates for this item
    if (debounceTimers.current[itemId]) {
      clearTimeout(debounceTimers.current[itemId]);
      delete debounceTimers.current[itemId];
    }

    // Optimistic update - instant UI feedback
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

    // Clear all pending timers
    Object.values(debounceTimers.current).forEach(timer => clearTimeout(timer));
    debounceTimers.current = {};

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
          {/* <div className="summary-row">
            <span>Shipping</span>
            <span>FREE</span>
          </div> */}
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

          <Link to="/checkout">
            <button className="checkout-btn">Proceed to Checkout</button>
          </Link>
          <button className="clear-btn" onClick={handleClear}>
            Clear Cart
          </button>
        </div>
      </div>
    </>
  );
};

export default Cart;