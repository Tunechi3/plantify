import React, { createContext, useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { fetchUserCart, setCart } from "../app/cartSlice";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const logoutTimerRef = useRef(null);

  const token = localStorage.getItem("token");

  // Helper function to check if token is expired
  const isTokenExpired = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      return Date.now() >= expirationTime;
    } catch (err) {
      return true; // Invalid token format
    }
  };

  // Helper function to get time until token expires
  const getTimeUntilExpiry = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000;
      return expirationTime - Date.now();
    } catch (err) {
      return 0;
    }
  };

  // Set auto-logout timer
  const setAutoLogoutTimer = (token) => {
    // Clear existing timer
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
    }

    const timeUntilExpiry = getTimeUntilExpiry(token);
    
    if (timeUntilExpiry > 0) {
      logoutTimerRef.current = setTimeout(() => {
        logout();
        toast.info("Session expired. Please login again.");
        navigate("/login");
      }, timeUntilExpiry);
    }
  };

  // Initialize on mount
  useEffect(() => {
    const initializeCart = async () => {
      if (token) {
        // Check if token is expired
        if (isTokenExpired(token)) {
          // Token expired - logout
          localStorage.removeItem("token");
          setIsLoggedIn(false);
          toast.info("Session expired. Please login again.");
          
          // Load guest cart as fallback
          const guestCart = JSON.parse(localStorage.getItem("cart")) || [];
          dispatch(setCart(guestCart));
          setIsInitialized(true);
          return;
        }

        // Token is valid
        setIsLoggedIn(true);
        
        // Set auto-logout timer for when token expires
        setAutoLogoutTimer(token);
        
        try {
          // Fetch user's cart from backend
          await dispatch(fetchUserCart(token)).unwrap();
        } catch (error) {
          console.error("Failed to fetch user cart:", error);
          
          // If token is invalid, clear it
          if (error.includes("Authentication") || error.includes("token") || error.includes("expired")) {
            localStorage.removeItem("token");
            setIsLoggedIn(false);
            
            // Clear the logout timer
            if (logoutTimerRef.current) {
              clearTimeout(logoutTimerRef.current);
            }
            
            // Load guest cart as fallback
            const guestCart = JSON.parse(localStorage.getItem("cart")) || [];
            dispatch(setCart(guestCart));
          }
        }
      } else {
        setIsLoggedIn(false);
        
        // Load guest cart from localStorage
        const guestCart = JSON.parse(localStorage.getItem("cart")) || [];
        dispatch(setCart(guestCart));
      }
      
      setIsInitialized(true);
    };

    initializeCart();

    // Cleanup timeout on unmount
    return () => {
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
      }
    };
  }, [token, dispatch]);

  const login = () => {
    setIsLoggedIn(true);
    
    // Set auto-logout timer for 7 days
    const token = localStorage.getItem("token");
    if (token) {
      setAutoLogoutTimer(token);
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("token");
    
    // Clear the auto-logout timer
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
    
    // Amazon-style: Keep cart in localStorage for guest mode
    // Don't clear the cart - just switch to guest mode
    const currentCart = JSON.parse(localStorage.getItem("cart")) || [];
    dispatch(setCart(currentCart));
  };

  return (
    <UserContext.Provider value={{ isLoggedIn, login, logout, isInitialized }}>
      {children}
    </UserContext.Provider>
  );
};