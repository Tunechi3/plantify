import React, { useContext, useRef, useState } from "react";
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
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../components/UserContext";
import { toast } from "react-toastify";
import "../Addproduct.css";


const Cart = () => {
  const { isLoggedIn } = useContext(UserContext);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = useSelector((state) => state.cart.items);
  const [showClearModal, setShowClearModal] = useState(false);
  
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

  const handleClearClick = () => {
    setShowClearModal(true);
  };

  const handleConfirmClear = () => {
    // Clear all pending timers
    Object.values(debounceTimers.current).forEach(timer => clearTimeout(timer));
    debounceTimers.current = {};

    // Close modal
    setShowClearModal(false);

    // Dispatch clear cart - the action handles both guest and logged-in users
    dispatch(clearCart());
    toast.success("Cart cleared");
  };

  const handleCancelClear = () => {
    setShowClearModal(false);
  };

  const handleProceedToCheckout = () => {
    if (!isLoggedIn) {
      toast.info("Please login to proceed to checkout");
      navigate("/login", { state: { from: "/checkout" } });
    } else {
      navigate("/checkout");
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

          <button className="checkout-btn" onClick={handleProceedToCheckout}>
            Proceed to Checkout
          </button>
          <button className="clear-btn" onClick={handleClearClick}>
            Clear Cart
          </button>
        </div>
      </div>

      {/* Clear Cart Confirmation Modal */}
      {showClearModal && (
        <div className="modal-overlay" onClick={handleCancelClear}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Clear Cart?</h3>
            <p>Are you sure you want to remove all items from your cart?</p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={handleCancelClear}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleConfirmClear}>
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Cart;