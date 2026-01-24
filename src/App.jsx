import { useState } from 'react'
import './App.css'
import Home from './pages/Home'
import Loginpage from './pages/Loginpage'
import { Link, Route, Router, Routes} from 'react-router-dom'
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Cart from './pages/Cart'
import Searchresults from './pages/Searchresults'
import Wishlistpage from './pages/Wishlistpage'
import AddProduct from './pages/Addproduct'
import Profilepage from './pages/Profilepage'
import CheckoutPage from './pages/Checkoutpage'



function App() {

  return (

    <>
    

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Loginpage />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/search" element={<Searchresults />} />
        <Route path="/wishlist" element={<Wishlistpage/>}/>
        <Route path="/addProduct" element={<AddProduct/>}/>
        <Route path="/profile" element={<Profilepage/>}/>
        <Route path="/checkout" element={<CheckoutPage/>}/>
       
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
      />
    </>
      

  
   )
}

export default App
