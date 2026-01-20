import React, { useState, useEffect } from 'react';
import '../Checkout.css';

const Checkoutpage = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [cartItems, setCartItems] = useState([]);
  const [userData, setUserData] = useState({
    fullname: '',
    email: '',
    phone: '',
  });

  const [shippingInfo, setShippingInfo] = useState({
    fullname: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    shippingMethod: 'standard',
  });

  const [paymentInfo, setPaymentInfo] = useState({
    method: 'card',
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  });

  const [useSavedAddress, setUseSavedAddress] = useState(false);

  const shippingMethods = [
    { id: 'standard', name: 'Standard Shipping', price: 5.00, days: '5-7 business days' },
    { id: 'express', name: 'Express Shipping', price: 15.00, days: '2-3 business days' },
    { id: 'overnight', name: 'Overnight Shipping', price: 25.00, days: '1 business day' },
  ];

  useEffect(() => {
    fetchCartAndProfile();
  }, []);

  const fetchCartAndProfile = async () => {
  try {
    const token = localStorage.getItem('token');
    
    // Fetch user profile
    const profileResponse = await fetch('http://localhost:3000/api/users/profile', {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const profileData = await profileResponse.json();
    
    if (profileData.status) {
      setUserData({
        fullname: profileData.data.fullname,
        email: profileData.data.email,
        phone: profileData.data.phone || '',
      });

      // Pre-fill shipping with saved address if available
      if (profileData.data.shippingAddress?.street) {
        setShippingInfo(prev => ({
          ...prev,
          fullname: profileData.data.fullname,
          phone: profileData.data.phone || '',
          street: profileData.data.shippingAddress.street,
          city: profileData.data.shippingAddress.city,
          state: profileData.data.shippingAddress.state,
          zipCode: profileData.data.shippingAddress.zipCode,
          country: profileData.data.shippingAddress.country,
        }));
      }
    }

    // Fetch cart items
    const cartResponse = await fetch('http://localhost:3000/api/cart', {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const cartData = await cartResponse.json();
    
    console.log("Cart response:", cartData); // 🔍 DEBUG
    
    if (cartData.status && Array.isArray(cartData.data)) {
      setCartItems(cartData.data);
    } else {
      console.error("Invalid cart data format:", cartData);
      showMessage('error', 'Failed to load cart items');
      setCartItems([]);
    }
  } catch (error) {
    console.error("Fetch error:", error);
    showMessage('error', 'Failed to load checkout data');
    setCartItems([]);
  } finally {
    setLoading(false);
  }
};

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleShippingChange = (field, value) => {
    setShippingInfo(prev => ({ ...prev, [field]: value }));
  };

  const handlePaymentChange = (field, value) => {
    setPaymentInfo(prev => ({ ...prev, [field]: value }));
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateShipping = () => {
    const method = shippingMethods.find(m => m.id === shippingInfo.shippingMethod);
    return method ? method.price : 0;
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.08; // 8% tax
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping() + calculateTax();
  };

  const validateStep = (currentStep) => {
    if (currentStep === 1) {
      const { fullname, phone, street, city, state, zipCode, country } = shippingInfo;
      if (!fullname || !phone || !street || !city || !state || !zipCode || !country) {
        showMessage('error', 'Please fill in all shipping fields');
        return false;
      }
    }
    if (currentStep === 2) {
      if (paymentInfo.method === 'card') {
        const { cardNumber, cardName, expiryDate, cvv } = paymentInfo;
        if (!cardNumber || !cardName || !expiryDate || !cvv) {
          showMessage('error', 'Please fill in all payment details');
          return false;
        }
      }
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePreviousStep = () => {
    setStep(step - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlaceOrder = async () => {
    if (!validateStep(2)) return;

    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const orderData = {
        shippingInfo,
        paymentInfo: { method: paymentInfo.method },
        items: cartItems,
        subtotal: calculateSubtotal(),
        shipping: calculateShipping(),
        tax: calculateTax(),
        total: calculateTotal(),
      };

      const response = await fetch('http://localhost:3000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();
      if (result.status) {
        setStep(4); // Success step
        showMessage('success', 'Order placed successfully!');
      } else {
        showMessage('error', result.message || 'Failed to place order');
      }
    } catch (error) {
      showMessage('error', 'Failed to place order. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="eco-checkout-container">
        <div className="eco-loading">Loading checkout...</div>
      </div>
    );
  }

  return (
    <div className="eco-checkout-container">
      <div className="eco-checkout-wrapper">
        {/* Progress Steps */}
        <div className="eco-progress-container">
          <div className="eco-progress-steps">
            <div className={`eco-progress-step ${step >= 1 ? 'eco-active' : ''} ${step > 1 ? 'eco-completed' : ''}`}>
              <div className="eco-step-number">1</div>
              <div className="eco-step-label">Shipping</div>
            </div>
            <div className="eco-progress-line"></div>
            <div className={`eco-progress-step ${step >= 2 ? 'eco-active' : ''} ${step > 2 ? 'eco-completed' : ''}`}>
              <div className="eco-step-number">2</div>
              <div className="eco-step-label">Payment</div>
            </div>
            <div className="eco-progress-line"></div>
            <div className={`eco-progress-step ${step >= 3 ? 'eco-active' : ''} ${step > 3 ? 'eco-completed' : ''}`}>
              <div className="eco-step-number">3</div>
              <div className="eco-step-label">Review</div>
            </div>
          </div>
        </div>

        {message.text && (
          <div className={`eco-message eco-message-${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="eco-checkout-content">
          {/* Main Content */}
          <div className="eco-main-section">
            {/* Step 1: Shipping Information */}
            {step === 1 && (
              <div className="eco-step-content">
                <h2 className="eco-section-title">Shipping Information</h2>
                
                {userData.fullname && (
                  <div className="eco-saved-address-option">
                    <input
                      type="checkbox"
                      id="useSaved"
                      checked={useSavedAddress}
                      onChange={(e) => setUseSavedAddress(e.target.checked)}
                      className="eco-checkbox"
                    />
                    <label htmlFor="useSaved" className="eco-checkbox-label">
                      Use saved address from profile
                    </label>
                  </div>
                )}

                <div className="eco-form-grid">
                  <div className="eco-form-group eco-form-group-full">
                    <label className="eco-label">Full Name *</label>
                    <input
                      type="text"
                      value={shippingInfo.fullname}
                      onChange={(e) => handleShippingChange('fullname', e.target.value)}
                      className="eco-input"
                      placeholder="John Doe"
                    />
                  </div>

                  <div className="eco-form-group eco-form-group-full">
                    <label className="eco-label">Phone Number *</label>
                    <input
                      type="tel"
                      value={shippingInfo.phone}
                      onChange={(e) => handleShippingChange('phone', e.target.value)}
                      className="eco-input"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>

                  <div className="eco-form-group eco-form-group-full">
                    <label className="eco-label">Street Address *</label>
                    <input
                      type="text"
                      value={shippingInfo.street}
                      onChange={(e) => handleShippingChange('street', e.target.value)}
                      className="eco-input"
                      placeholder="123 Main Street"
                    />
                  </div>

                  <div className="eco-form-group">
                    <label className="eco-label">City *</label>
                    <input
                      type="text"
                      value={shippingInfo.city}
                      onChange={(e) => handleShippingChange('city', e.target.value)}
                      className="eco-input"
                      placeholder="New York"
                    />
                  </div>

                  <div className="eco-form-group">
                    <label className="eco-label">State/Province *</label>
                    <input
                      type="text"
                      value={shippingInfo.state}
                      onChange={(e) => handleShippingChange('state', e.target.value)}
                      className="eco-input"
                      placeholder="NY"
                    />
                  </div>

                  <div className="eco-form-group">
                    <label className="eco-label">Zip/Postal Code *</label>
                    <input
                      type="text"
                      value={shippingInfo.zipCode}
                      onChange={(e) => handleShippingChange('zipCode', e.target.value)}
                      className="eco-input"
                      placeholder="10001"
                    />
                  </div>

                  <div className="eco-form-group">
                    <label className="eco-label">Country *</label>
                    <input
                      type="text"
                      value={shippingInfo.country}
                      onChange={(e) => handleShippingChange('country', e.target.value)}
                      className="eco-input"
                      placeholder="United States"
                    />
                  </div>
                </div>

                <h3 className="eco-subsection-title">Shipping Method</h3>
                <div className="eco-shipping-methods">
                  {shippingMethods.map(method => (
                    <div
                      key={method.id}
                      className={`eco-shipping-method ${shippingInfo.shippingMethod === method.id ? 'eco-selected' : ''}`}
                      onClick={() => handleShippingChange('shippingMethod', method.id)}
                    >
                      <input
                        type="radio"
                        name="shipping"
                        checked={shippingInfo.shippingMethod === method.id}
                        onChange={() => handleShippingChange('shippingMethod', method.id)}
                        className="eco-radio"
                      />
                      <div className="eco-shipping-details">
                        <div className="eco-shipping-name">{method.name}</div>
                        <div className="eco-shipping-time">{method.days}</div>
                      </div>
                      <div className="eco-shipping-price">${method.price.toFixed(2)}</div>
                    </div>
                  ))}
                </div>

                <div className="eco-step-actions">
                  <button onClick={handleNextStep} className="eco-btn eco-btn-primary">
                    Continue to Payment
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Payment Information */}
            {step === 2 && (
              <div className="eco-step-content">
                <h2 className="eco-section-title">Payment Information</h2>

                <div className="eco-payment-methods">
                  <div
                    className={`eco-payment-method ${paymentInfo.method === 'card' ? 'eco-selected' : ''}`}
                    onClick={() => handlePaymentChange('method', 'card')}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentInfo.method === 'card'}
                      onChange={() => handlePaymentChange('method', 'card')}
                      className="eco-radio"
                    />
                    <div className="eco-payment-label">Credit/Debit Card</div>
                  </div>
                  <div
                    className={`eco-payment-method ${paymentInfo.method === 'paypal' ? 'eco-selected' : ''}`}
                    onClick={() => handlePaymentChange('method', 'paypal')}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentInfo.method === 'paypal'}
                      onChange={() => handlePaymentChange('method', 'paypal')}
                      className="eco-radio"
                    />
                    <div className="eco-payment-label">PayPal</div>
                  </div>
                  <div
                    className={`eco-payment-method ${paymentInfo.method === 'cod' ? 'eco-selected' : ''}`}
                    onClick={() => handlePaymentChange('method', 'cod')}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentInfo.method === 'cod'}
                      onChange={() => handlePaymentChange('method', 'cod')}
                      className="eco-radio"
                    />
                    <div className="eco-payment-label">Cash on Delivery</div>
                  </div>
                </div>

                {paymentInfo.method === 'card' && (
                  <div className="eco-form-grid">
                    <div className="eco-form-group eco-form-group-full">
                      <label className="eco-label">Card Number *</label>
                      <input
                        type="text"
                        value={paymentInfo.cardNumber}
                        onChange={(e) => handlePaymentChange('cardNumber', e.target.value)}
                        className="eco-input"
                        placeholder="1234 5678 9012 3456"
                        maxLength="19"
                      />
                    </div>

                    <div className="eco-form-group eco-form-group-full">
                      <label className="eco-label">Cardholder Name *</label>
                      <input
                        type="text"
                        value={paymentInfo.cardName}
                        onChange={(e) => handlePaymentChange('cardName', e.target.value)}
                        className="eco-input"
                        placeholder="John Doe"
                      />
                    </div>

                    <div className="eco-form-group">
                      <label className="eco-label">Expiry Date *</label>
                      <input
                        type="text"
                        value={paymentInfo.expiryDate}
                        onChange={(e) => handlePaymentChange('expiryDate', e.target.value)}
                        className="eco-input"
                        placeholder="MM/YY"
                        maxLength="5"
                      />
                    </div>

                    <div className="eco-form-group">
                      <label className="eco-label">CVV *</label>
                      <input
                        type="text"
                        value={paymentInfo.cvv}
                        onChange={(e) => handlePaymentChange('cvv', e.target.value)}
                        className="eco-input"
                        placeholder="123"
                        maxLength="4"
                      />
                    </div>
                  </div>
                )}

                {paymentInfo.method === 'paypal' && (
                  <div className="eco-payment-info-box">
                    <p>You will be redirected to PayPal to complete your payment securely.</p>
                  </div>
                )}

                {paymentInfo.method === 'cod' && (
                  <div className="eco-payment-info-box">
                    <p>Pay with cash when your order is delivered. An additional fee of $3.00 may apply.</p>
                  </div>
                )}

                <div className="eco-step-actions">
                  <button onClick={handlePreviousStep} className="eco-btn eco-btn-secondary">
                    Back to Shipping
                  </button>
                  <button onClick={handleNextStep} className="eco-btn eco-btn-primary">
                    Review Order
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Order Review */}
            {step === 3 && (
              <div className="eco-step-content">
                <h2 className="eco-section-title">Review Your Order</h2>

                <div className="eco-review-section">
                  <h3 className="eco-review-heading">Shipping Address</h3>
                  <div className="eco-review-card">
                    <p className="eco-review-text"><strong>{shippingInfo.fullname}</strong></p>
                    <p className="eco-review-text">{shippingInfo.phone}</p>
                    <p className="eco-review-text">{shippingInfo.street}</p>
                    <p className="eco-review-text">
                      {shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}
                    </p>
                    <p className="eco-review-text">{shippingInfo.country}</p>
                  </div>
                </div>

                <div className="eco-review-section">
                  <h3 className="eco-review-heading">Shipping Method</h3>
                  <div className="eco-review-card">
                    {shippingMethods.find(m => m.id === shippingInfo.shippingMethod) && (
                      <>
                        <p className="eco-review-text">
                          <strong>{shippingMethods.find(m => m.id === shippingInfo.shippingMethod).name}</strong>
                        </p>
                        <p className="eco-review-text">
                          {shippingMethods.find(m => m.id === shippingInfo.shippingMethod).days}
                        </p>
                      </>
                    )}
                  </div>
                </div>

                <div className="eco-review-section">
                  <h3 className="eco-review-heading">Payment Method</h3>
                  <div className="eco-review-card">
                    <p className="eco-review-text">
                      {paymentInfo.method === 'card' && `Card ending in ${paymentInfo.cardNumber.slice(-4)}`}
                      {paymentInfo.method === 'paypal' && 'PayPal'}
                      {paymentInfo.method === 'cod' && 'Cash on Delivery'}
                    </p>
                  </div>
                </div>

                <div className="eco-step-actions">
                  <button onClick={handlePreviousStep} className="eco-btn eco-btn-secondary">
                    Back to Payment
                  </button>
                  <button onClick={handlePlaceOrder} disabled={processing} className="eco-btn eco-btn-primary">
                    {processing ? 'Processing...' : 'Place Order'}
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Order Success */}
            {step === 4 && (
              <div className="eco-step-content eco-success-content">
                <div className="eco-success-icon">✓</div>
                <h2 className="eco-success-title">Order Placed Successfully!</h2>
                <p className="eco-success-text">
                  Thank you for your purchase. Your order has been received and is being processed.
                </p>
                <p className="eco-success-text">
                  You will receive an email confirmation shortly at <strong>{userData.email}</strong>
                </p>
                <div className="eco-success-actions">
                  <a href="/" className="eco-btn eco-btn-primary">Continue Shopping</a>
                  <a href="/orders" className="eco-btn eco-btn-secondary">View Orders</a>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          {step < 4 && (
            <div className="eco-sidebar">
              <div className="eco-order-summary">
                <h3 className="eco-summary-title">Order Summary</h3>
                
                <div className="eco-cart-items">
                  {cartItems.map((item, index) => (
                    <div key={index} className="eco-cart-item">
                      <img src={item.image || '/placeholder.jpg'} alt={item.name} className="eco-item-image" />
                      <div className="eco-item-details">
                        <div className="eco-item-name">{item.name}</div>
                        <div className="eco-item-quantity">Qty: {item.quantity}</div>
                      </div>
                      <div className="eco-item-price">${(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                  ))}
                </div>

                <div className="eco-summary-divider"></div>

                <div className="eco-summary-row">
                  <span>Subtotal</span>
                  <span>${calculateSubtotal().toFixed(2)}</span>
                </div>

                <div className="eco-summary-row">
                  <span>Shipping</span>
                  <span>${calculateShipping().toFixed(2)}</span>
                </div>

                <div className="eco-summary-row">
                  <span>Tax (8%)</span>
                  <span>${calculateTax().toFixed(2)}</span>
                </div>

                <div className="eco-summary-divider"></div>

                <div className="eco-summary-row eco-summary-total">
                  <span>Total</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Checkoutpage;