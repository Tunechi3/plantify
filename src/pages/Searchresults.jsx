import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Categories from "../components/Categories";
import API_URL from "../config";

const Searchresults = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const searchQuery = new URLSearchParams(location.search).get("q") || "";
  const categoryId = new URLSearchParams(location.search).get("category") || "";

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const catRes = await axios.get(`${API_URL}/api/categories`);
        const prodRes = await axios.get(`${API_URL}/api/products`);

        setCategories(catRes.data);
        setProducts(
          prodRes.data.map((prod) => ({
            ...prod,
            category: prod.category ? prod.category : null,
          }))
        );
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  // Filter products by category and search query
  const filteredProducts = products.filter((product) => {
    const matchesCategory = categoryId
      ? product.category?._id === categoryId
      : true;
    const matchesSearch = searchQuery
      ? product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category?.name
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase())
      : true;
    return matchesCategory && matchesSearch;
  });

  return (
    <div>
      <Navbar />

      {/* Header */}
      {/* <div
        style={{
          textAlign: "center",
          padding: "40px 20px",
          backgroundColor: "#f5f5f5",
          borderBottom: "2px solid #ddd",
        }}
      >
        <h2 style={{ fontSize: "2rem", marginBottom: "10px" }}>
          {categoryId
            ? `Products in this Category`
            : searchQuery
            ? `Search Results for: "${searchQuery}"`
            : "All Products"}
        </h2>
        <p style={{ fontSize: "1rem", color: "#555" }}>
          {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""} found
        </p>

        {categoryId && (
          <button
            onClick={() => navigate("/")}
            style={{
              marginTop: "15px",
              padding: "10px 20px",
              backgroundColor: "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Return Home
          </button>
        )}
      </div> */}

      <Categories
        categories={categories}
        products={filteredProducts}
        isSearchPage={!!categoryId}
      />

      <Footer />
    </div>
  );
};

export default Searchresults;
