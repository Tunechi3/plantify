import { useState } from 'react'
import './App.css'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Footer from './components/Footer'
// import Categoriessection from './components/Categoriessection'
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

    
    // <>
    //   <Navbar/>
    //   <Home/>
    //   <Categoriessection/>
    //   <Loginpage/>
    //   <Footer/>
    // </>

    <>
      {/* <nav>
        <Link to="/">Home</Link>
      </nav> */}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Loginpage />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/search" element={<Searchresults />} />
        <Route path="/wishlist" element={<Wishlistpage/>}/>
        <Route path="/addProduct" element={<AddProduct/>}/>
        <Route path="/profile" element={<Profilepage/>}/>
        <Route path="/checkout" element={<CheckoutPage/>}/>
        {/* <Route path="/dashboard" element={<Dashboard />} /> */}
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
      
  //    <Router>
     

  //      <Routes>
  //       <Route path="/" element={<Home />} /> 
  //       {<Route path="/admin-signup" element={<Adminsignup />} />
  //       <Route path="/admin-login" element={<Adminlogin />} />
  //       <Route path="/customer-signup" element={<Customersignup />} />
  //       <Route path="/customer-login" element={<Customerlogin />} />
  //       <Route path="/adminfood" element={<Adminfood/>} />
  //       <Route path="/customerfood" element={<Customerfood/>} />
  //       <Route path="/add-food" element={token ? <Addfood /> : <Adminlogin />} />
  //       <Route path="/cart" element={<Cartpage />} /> */}
  //       { <Route path="/checkout" element={<CheckoutPage />} />}
  //    </Routes>
  // </Router>


  
   )
}

export default App
