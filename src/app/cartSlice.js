import { createSlice } from "@reduxjs/toolkit";

const loadCartFromStorage = () => {
  try {
    const data = localStorage.getItem("cartItems");
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveCartToStorage = (items) => {
  localStorage.setItem("cartItems", JSON.stringify(items));
};

const initialState = {
  items: loadCartFromStorage(),
};  

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;
      const existing = state.items.find((i) => i._id === item._id);
      if (existing) {
        existing.quantity += item.quantity || 1;
      } else {
        state.items.push({ ...item, quantity: item.quantity || 1 });
      }
      saveCartToStorage(state.items);
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter((i) => i._id !== action.payload);
      saveCartToStorage(state.items);
    },
    increaseQty: (state, action) => {
      const item = state.items.find((i) => i._id === action.payload);
      if (item) item.quantity += 1;
      saveCartToStorage(state.items);
    },
    decreaseQty: (state, action) => {
      const item = state.items.find((i) => i._id === action.payload);
      if (item && item.quantity > 1) item.quantity -= 1;
      saveCartToStorage(state.items);
    },
    clearCart: (state) => {
      state.items = [];
      saveCartToStorage([]);
    },
  },
});

export const { addToCart, removeFromCart, increaseQty, decreaseQty, clearCart } =
  cartSlice.actions;

export default cartSlice.reducer;
