import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/autoplay";
import { FaShippingFast, FaCreditCard, FaHeadset } from 'react-icons/fa';
import Footer from '../components/Footer';
import Loginpage from './Loginpage';
import Addproduct from './Addproduct';
import axios from 'axios';
import CategoriesSection from '../components/CategoriesSection.jsx';

const Home = () => {
  const categoriess = [
    { name: "Electronics", img: "https://images.unsplash.com/photo-1498049794561-7780e7231661?ixlib=rb-4.0.3&w=500&h=500&fit=crop&crop=center" },
    { name: "Fashion", img: "https://images.unsplash.com/photo-1445205170230-053b83016050?ixlib=rb-4.0.3&w=500&h=500&fit=crop&crop=center" },
    { name: "Beauty", img: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&w=500&h=500&fit=crop&crop=center" },
    { name: "Home", img: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&w=500&h=500&fit=crop&crop=center" },
    { name: "Sports", img: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&w=500&h=500&fit=crop&crop=center" },
  ];

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const catRes = await axios.get("http://localhost:3000/api/categories");
        const prodRes = await axios.get("http://localhost:3000/api/products");

        // Map products so they match category object
        const mappedProducts = prodRes.data.map(prod => ({
          ...prod,
          category: prod.category ? prod.category : null
        }));

        setCategories(catRes.data);
        setProducts(mappedProducts);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <Navbar/>
      <div className='hero-container'>
        <div className='hero-content'>
          <div className='hero-text'>
            <h4>Style That Speaks Before You Do</h4>
            <p>Discover amazing products at unbeatable prices. Shop the latest trends 
            with fast delivery and exceptional customer service.</p>
            <div className='hero-buttons'>
              <button className='btn btn-primary'>Shop Now</button>
              <button className='btn btn-secondary'>Learn More</button>
            </div>
          </div>

          <div className='hero-image'>
            <Swiper
              modules={[Autoplay, Pagination]}
              autoplay={{ delay: 2000 }}
              pagination={{ clickable: true }}
              loop={true}
              spaceBetween={20}
              style={{ width: "100%", height: "400px", borderRadius: "10px" }}
            >
              {categoriess.map((item, index) => (
                <SwiperSlide key={index}>
                  <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <img src={item.img} alt={item.name} style={{ width: "100%", height: "400px", maxWidth: "850px", marginBottom: "20px", borderRadius: "10px", objectFit: "cover" }} />
                    <h3 style={{ marginTop: "10px", color: "white" }}>{item.name}</h3>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>
      <CategoriesSection categories={categories} products={products} />
      <Footer/>
    </>
  );
}

export default Home;
