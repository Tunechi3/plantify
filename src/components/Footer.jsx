import React from 'react'
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaShippingFast, FaHeadset, FaCreditCard, FaShieldAlt } from 'react-icons/fa';
const Footer = () => {
  return (
    <>
        <div className='services-section'>
                <div className='services-container'>
                  {/* Free Delivery Box */}
                  <div className='service-box'>
                    <div className='service-icon'>
                      <FaShippingFast />
                    </div>
                    <h3 className='service-title'>Free Delivery</h3>
                    <p className='service-description'>
                      Free shipping on all orders over $200. Fast and reliable delivery to your doorstep.
                    </p>
                  </div>
        
                  {/* Flexible Payment Box */}
                  <div className='service-box'>
                    <div className='service-icon'>
                      <FaCreditCard />
                    </div>
                    <h3 className='service-title'>Flexible Payment</h3>
                    <p className='service-description'>
                      Multiple payment options including credit cards, PayPal, and installment plans.
                    </p>
                  </div>
        
                  {/* 24/7 Support Box */}
                  <div className='service-box'>
                    <div className='service-icon'>
                      <FaHeadset />
                    </div>
                    <h3 className='service-title'>24/7 Support</h3>
                    <p className='service-description'>
                      Round-the-clock customer support. We're here to help you anytime, anywhere.
                    </p>
                  </div>
                </div>
              </div>
        <footer className="footer">
      {/* Main Footer Content */}
      <div className="footer-main">
        <div className="footer-container">
          
          {/* Company Info */}
          <div className="footer-section">
            <div className="footer-logo">
              <div className="logo-icon">🛍️</div>
              <span className="company-name">NovaNest</span>
            </div>
            <p className="footer-description">
              Your premier destination for quality products at unbeatable prices. 
              We're committed to providing exceptional shopping experiences with 
              fast delivery and outstanding customer service.
            </p>
            <div className="social-links">
              <a href="#" className="social-link" aria-label="Facebook">
                <FaFacebookF />
              </a>
              <a href="#" className="social-link" aria-label="Twitter">
                <FaTwitter />
              </a>
              <a href="#" className="social-link" aria-label="Instagram">
                <FaInstagram />
              </a>
              <a href="#" className="social-link" aria-label="LinkedIn">
                <FaLinkedinIn />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h3 className="footer-title">Quick Links</h3>
            <ul className="footer-links">
              <li><a href="/">Home</a></li>
              <li><a href="/shop">Shop</a></li>
              <li><a href="/categories">Categories</a></li>
              <li><a href="/new-arrivals">New Arrivals</a></li>
              <li><a href="/deals">Hot Deals</a></li>
              <li><a href="/about">About Us</a></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="footer-section">
            <h3 className="footer-title">Customer Service</h3>
            <ul className="footer-links">
              <li><a href="/contact">Contact Us</a></li>
              <li><a href="/shipping">Shipping Info</a></li>
              <li><a href="/returns">Returns & Exchanges</a></li>
              <li><a href="/size-guide">Size Guide</a></li>
              <li><a href="/faq">FAQ</a></li>
              <li><a href="/privacy">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-section">
            <h3 className="footer-title">Contact Info</h3>
            <div className="contact-info">
              <div className="contact-item">
                <span className="contact-icon">📍</span>
                <span>12 Okikiola Street, Isale Ontairo, Osun State Nigeria</span>
              </div>
              <div className="contact-item">
                <span className="contact-icon">📞</span>
                <span>0706 414 7609</span>
              </div>
              <div className="contact-item">
                <span className="contact-icon">✉️</span>
                <span>support@novanest.com</span>
              </div>
            </div>
            
            {/* Newsletter Subscription */}
            <div className="newsletter">
              <h4 className="newsletter-title">Newsletter</h4>
              <p className="newsletter-text">Subscribe for updates and exclusive offers</p>
              <div className="newsletter-form">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="newsletter-input"
                />
                <button className="newsletter-btn">Subscribe</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="trust-badges">
        <div className="trust-container">
          <div className="trust-item">
            <FaShippingFast className="trust-icon" />
            <span>Free Shipping Over $200</span>
          </div>
          <div className="trust-item">
            <FaShieldAlt className="trust-icon" />
            <span>Secure Payment</span>
          </div>
          <div className="trust-item">
            <FaHeadset className="trust-icon" />
            <span>24/7 Support</span>
          </div>
          <div className="trust-item">
            <FaCreditCard className="trust-icon" />
            <span>Flexible Payment</span>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <div className="copyright">
            <p>&copy; 2025 NovaNest. All rights reserved.</p>
          </div>
          <div className="footer-bottom-links">
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms of Service</a>
            <a href="/cookies">Cookie Policy</a>
          </div>
          <div className="payment-methods">
            <span className="payment-text">We Accept:</span>
            <div className="payment-icons">
              <span className="payment-icon">💳</span>
              <span className="payment-icon">🅿️</span>
              {/* <span className="payment-icon">🍎</span>
              <span className="payment-icon">Ⓜ️</span> */}
            </div>
          </div>
        </div>
      </div>
    </footer>
    </>
  )
}

export default Footer