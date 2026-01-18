import React, { createContext, useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchUserCart, setCart } from "../app/cartSlice";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const dispatch = useDispatch();

  const token = localStorage.getItem("token");

  // Initialize on mount
  useEffect(() => {
    const initializeCart = async () => {
      if (token) {
        setIsLoggedIn(true);
        
        try {
          // Fetch user's cart from backend
          await dispatch(fetchUserCart(token)).unwrap();
        } catch (error) {
          console.error("Failed to fetch user cart:", error);
          
          // If token is invalid, clear it
          if (error.includes("Authentication") || error.includes("token")) {
            localStorage.removeItem("token");
            setIsLoggedIn(false);
            
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
  }, [token, dispatch]);

  const login = () => {
    setIsLoggedIn(true);
  };

  const logout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("token");
    
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