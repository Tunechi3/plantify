import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { FaTrash, FaPlus, FaMinus } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
// import { removeFromCart, increaseQty, decreaseQty } from "../slices/cartSlice";
import "../Addproduct.css";
import { decreaseQty, increaseQty, removeFromCart } from "../app/cartSlice";
import { Link } from "react-router-dom";

const Cart = () => {
  // const cartItems = useSelector((state) => state.cart.items);
  // const dispatch = useDispatch();

  // const totalPrice = cartItems.reduce(
  //   (acc, item) => acc + item.price * item.quantity,
  //   0
  // );

  const { items } = useSelector((state) => state.cart);
  const dispatch = useDispatch();

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  if (items.length === 0) {
    return (
      <div className="empty-cart">
  <div className="empty-cart-content">
    <div className="empty-cart-icon">🛒</div>

    <h2>Your cart is empty</h2>
    <p>
      Looks like you haven’t added anything to your cart yet.
      Start shopping to fill it up.
    </p>

    <Link to="/" className="empty-cart-btn">
      Continue Shopping
    </Link>
    </div>
  </div>
    );
  }

  return (
    <>
      <Navbar />
      {/* <div className="cart-container container">
        <h2 className="section-title">Your Shopping Cart</h2>

        {cartItems.length === 0 ? (
          <p>Your cart is empty</p>
        ) : (
          <div className="cart-grid">
            <div className="cart-items">
              {cartItems.map((item) => (
                <div key={item._id} className="cart-card">
                  <img src={item.image} alt={item.name} className="cart-img" />
                  <div className="cart-info">
                    <h4>{item.name}</h4>
                    <p>${item.price}</p>
                    <div className="cart-qty">
                      <button
                        onClick={() => dispatch(decreaseQty(item._id))}
                        className="qty-btn"
                      >
                        <FaMinus />
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() => dispatch(increaseQty(item._id))}
                        className="qty-btn"
                      >
                        <FaPlus />
                      </button>
                    </div>
                  </div>
                  <button
                    className="remove-btn"
                    onClick={() => dispatch(removeFromCart(item._id))}
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <h3>Order Summary</h3>
              <p>Total Items: {cartItems.length}</p>
              <p>Total Price: ${totalPrice.toFixed(2)}</p>
              <button className="btn btn-primary checkout-btn">Checkout</button>
            </div>
          </div>
        )}
      </div> */}
      <div className="cart-page">
      <div className="cart-left">
        <h2 className="cart-title">Shopping Cart</h2>

        {items.map((item) => (
          <div className="cart-item" key={item._id}>
            <img
              src={item.image || "https://via.placeholder.com/120"}
              alt={item.name}
            />

            <div className="cart-details">
              <h4>{item.name}</h4>
              <p className="price">${item.price}</p>

              <div className="qty-controls">
                <button onClick={() => dispatch(decreaseQty(item._id))}>
                  −
                </button>
                <span>{item.quantity}</span>
                <button onClick={() => dispatch(increaseQty(item._id))}>
                  +
                </button>
              </div>
            </div>

            <div className="cart-actions">
              <p className="subtotal">
                ${(item.price * item.quantity).toFixed(2)}
              </p>
              <button
                className="remove-btn"
                onClick={() => dispatch(removeFromCart(item._id))}
              >
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
          <span>Total</span>
          <span className="summary-total">${total.toFixed(2)}</span>
        </div>

        <button className="checkout-btn">Proceed to Checkout</button>
        <button className="clear-btn" onClick={() => dispatch(clearCart())}>
          Clear Cart
        </button>
      </div>
    </div>
      <Footer />
    </>
  );
};

export default Cart;
