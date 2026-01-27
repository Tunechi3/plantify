import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import API_URL from "../config";

// const API_URL = "http://localhost:3000/api/cart";

// ========================================
// ASYNC THUNKS
// ========================================

// Fetch user cart from backend
export const fetchUserCart = createAsyncThunk(
  "cart/fetchUserCart",
  async (token, { rejectWithValue }) => {
    try {
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const cartData = res.data.data || res.data;
      
      return cartData.map(item => ({
        _id: item.product?._id || item._id,
        name: item.product?.name || item.name,
        price: item.product?.price || item.price,
        image: item.product?.image || item.image,
        category: item.product?.category || item.category,
        quantity: item.quantity,
      }));
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Add item to backend cart
export const addToBackendCart = createAsyncThunk(
  "cart/addToBackendCart",
  async ({ productId, quantity, token }, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `${API_URL}/add`,
        { productId, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const cartData = res.data.data || res.data;
      
      return cartData.map(item => ({
        _id: item.product?._id || item._id,
        name: item.product?.name || item.name,
        price: item.product?.price || item.price,
        image: item.product?.image || item.image,
        category: item.product?.category || item.category,
        quantity: item.quantity,
      }));
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Update item quantity in backend
export const updateBackendQty = createAsyncThunk(
  "cart/updateBackendQty",
  async ({ productId, quantity, token }, { rejectWithValue }) => {
    try {
      const res = await axios.put(
        `${API_URL}/update`,
        { productId, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const cartData = res.data.data || res.data;
      
      return cartData.map(item => ({
        _id: item.product?._id || item._id,
        name: item.product?.name || item.name,
        price: item.product?.price || item.price,
        image: item.product?.image || item.image,
        category: item.product?.category || item.category,
        quantity: item.quantity,
      }));
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Remove item from backend cart
export const removeFromBackendCart = createAsyncThunk(
  "cart/removeFromBackendCart",
  async ({ productId, token }, { rejectWithValue }) => {
    try {
      const res = await axios.delete(`${API_URL}/remove/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const cartData = res.data.data || res.data;
      
      return cartData.map(item => ({
        _id: item.product?._id || item._id,
        name: item.product?.name || item.name,
        price: item.product?.price || item.price,
        image: item.product?.image || item.image,
        category: item.product?.category || item.category,
        quantity: item.quantity,
      }));
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Clear backend cart
export const clearBackendCart = createAsyncThunk(
  "cart/clearBackendCart",
  async (token, { rejectWithValue }) => {
    try {
      await axios.post(
        `${API_URL}/clear`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Sync/merge guest cart with user cart on login
export const syncGuestCart = createAsyncThunk(
  "cart/syncGuestCart",
  async ({ guestCart, token }, { rejectWithValue }) => {
    try {
      const items = guestCart.map(item => ({
        productId: item._id,
        quantity: item.quantity,
      }));

      const res = await axios.post(
        `${API_URL}/sync`,
        { items },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const cartData = res.data.data || res.data;
      
      return cartData.map(item => ({
        _id: item.product?._id || item._id,
        name: item.product?.name || item.name,
        price: item.product?.price || item.price,
        image: item.product?.image || item.image,
        category: item.product?.category || item.category,
        quantity: item.quantity,
      }));
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ========================================
// AMAZON-STYLE UNIFIED CART ACTIONS
// ========================================

// Amazon-style: Add to cart (handles both guest and logged-in users)
export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async (product, { getState, dispatch, rejectWithValue }) => {
    const token = localStorage.getItem("token");
    
    if (token) {
      // Logged-in user: add to backend
      try {
        return await dispatch(
          addToBackendCart({ productId: product._id, quantity: 1, token })
        ).unwrap();
      } catch (err) {
        return rejectWithValue(err);
      }
    } else {
      // Guest: add to local cart
      return { product, isGuest: true };
    }
  }
);

// Amazon-style: Update quantity (handles both guest and logged-in users)
export const updateQuantity = createAsyncThunk(
  "cart/updateQuantity",
  async ({ productId, quantity }, { dispatch, rejectWithValue }) => {
    const token = localStorage.getItem("token");
    
    if (token) {
      // Logged-in user: update backend
      try {
        return await dispatch(
          updateBackendQty({ productId, quantity, token })
        ).unwrap();
      } catch (err) {
        return rejectWithValue(err);
      }
    } else {
      // Guest: update local cart
      return { productId, quantity, isGuest: true };
    }
  }
);

// Amazon-style: Remove from cart (handles both guest and logged-in users)
export const removeFromCart = createAsyncThunk(
  "cart/removeFromCart",
  async (productId, { dispatch, rejectWithValue }) => {
    const token = localStorage.getItem("token");
    
    if (token) {
      // Logged-in user: remove from backend
      try {
        return await dispatch(
          removeFromBackendCart({ productId, token })
        ).unwrap();
      } catch (err) {
        return rejectWithValue(err);
      }
    } else {
      // Guest: remove from local cart
      return { productId, isGuest: true };
    }
  }
);

// Amazon-style: Clear cart (handles both guest and logged-in users)
export const clearCart = createAsyncThunk(
  "cart/clearCart",
  async (_, { dispatch, rejectWithValue }) => {
    const token = localStorage.getItem("token");
    
    if (token) {
      // Logged-in user: clear backend
      try {
        return await dispatch(clearBackendCart(token)).unwrap();
      } catch (err) {
        return rejectWithValue(err);
      }
    } else {
      // Guest: clear local cart
      return { isGuest: true };
    }
  }
);

// ========================================
// SLICE
// ========================================

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
    status: "idle",
    error: null,
  },
  reducers: {
    // Set cart (used for initialization)
    setCart: (state, action) => {
      state.items = action.payload;
    },

    // Optimistic update for better UX
    optimisticAddToCart: (state, action) => {
      const product = action.payload;
      const exists = state.items.find((item) => item._id === product._id);
      
      if (exists) {
        exists.quantity += 1;
      } else {
        state.items.push({ ...product, quantity: 1 });
      }
    },

    optimisticUpdateQty: (state, action) => {
      const { productId, quantity } = action.payload;
      const item = state.items.find((i) => i._id === productId);
      if (item) {
        item.quantity = quantity;
      }
    },

    optimisticRemove: (state, action) => {
      state.items = state.items.filter((item) => item._id !== action.payload);
    },

    // Rollback on error
    rollbackCart: (state, action) => {
      state.items = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch user cart
      .addCase(fetchUserCart.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchUserCart.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchUserCart.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Amazon-style unified add to cart
      .addCase(addToCart.fulfilled, (state, action) => {
        if (action.payload.isGuest) {
          // Guest cart
          const product = action.payload.product;
          const exists = state.items.find((item) => item._id === product._id);
          
          if (exists) {
            exists.quantity += 1;
          } else {
            state.items.push({ ...product, quantity: 1 });
          }
          localStorage.setItem("cart", JSON.stringify(state.items));
        } else {
          // Logged-in user
          state.items = action.payload;
        }
      })

      // Amazon-style unified update quantity
      .addCase(updateQuantity.fulfilled, (state, action) => {
        if (action.payload.isGuest) {
          // Guest cart - update local storage
          const { productId, quantity } = action.payload;
          const item = state.items.find((i) => i._id === productId);
          if (item) {
            item.quantity = quantity;
            localStorage.setItem("cart", JSON.stringify(state.items));
          }
        }
        // For logged-in users: DO NOTHING
        // Optimistic update already handled the UI
        // Backend call just confirms success - no state change needed
        // This prevents flickering!
      })

      // Handle update quantity errors
      .addCase(updateQuantity.rejected, (state, action) => {
        // Error handling is done in Cart.jsx via rollbackCart
        // Just track error state here if needed
        state.error = action.payload;
      })

      // Amazon-style unified remove from cart
      .addCase(removeFromCart.fulfilled, (state, action) => {
        if (action.payload.isGuest) {
          // Guest cart
          state.items = state.items.filter((item) => item._id !== action.payload.productId);
          localStorage.setItem("cart", JSON.stringify(state.items));
        } else {
          // Logged-in user
          state.items = action.payload;
        }
      })

      // Amazon-style unified clear cart
      .addCase(clearCart.fulfilled, (state, action) => {
        state.items = [];
        if (action.payload?.isGuest) {
          localStorage.removeItem("cart");
        }
      })

      // Sync guest cart
      .addCase(syncGuestCart.fulfilled, (state, action) => {
        state.items = action.payload;
        localStorage.removeItem("cart");
      });
  },
});

export const {
  setCart,
  optimisticAddToCart,
  optimisticUpdateQty,
  optimisticRemove,
  rollbackCart,
} = cartSlice.actions;

export default cartSlice.reducer;