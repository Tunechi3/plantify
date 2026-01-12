import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import "../Addproduct.css";
import { toast } from "react-toastify";


export default function AddProduct() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* ✅ FETCH CATEGORIES */
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/categories");
        setCategories(
          res.data.map(cat => ({
            id: cat._id,
            name: cat.name
          }))
        );
      } catch (err) {
        console.error("Could not fetch categories", err);
        setError("Failed to load categories");
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const ProductSchema = Yup.object().shape({
    name: Yup.string().min(3).required("Product name is required"),
    price: Yup.number().positive().required("Price is required"),
    description: Yup.string(),
    image: Yup.string().url("Invalid image URL"),
    categoryId: Yup.string().required("Please select a category"),
  });

  const initialValues = {
    name: "",
    price: "",
    description: "",
    image: "",
    categoryId: "",
  };

  /* ✅ SUBMIT PRODUCT */
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    toast.info("Adding product...");

    try {
      await axios.post("http://localhost:3000/api/products", {
        name: values.name,
        price: values.price,
        description: values.description,
        image: values.image,
        categoryId: values.categoryId,
      });

      toast.success("Product added successfully 🎉");
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add product");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="categories-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Add New Product</h2>
          <p className="section-subtitle">
            Add product details and choose a category.
          </p>
        </div>

        <div className="form-card">
          <div className="circle-1"></div>
          <div className="circle-2"></div>
          <div className="circle-3"></div>
          <div className="circle-4"></div>

          {error && <div className="error-msg">{error}</div>}
          {success && <div className="success-msg">{success}</div>}

          <Formik
            initialValues={initialValues}
            validationSchema={ProductSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form>
                <div className="grid-two-columns">
                  <div className="form-group">
                    <label>Product Name *</label>
                    <Field name="name" className="input-field" />
                    <ErrorMessage name="name" component="div" className="error-msg" />
                  </div>

                  <div className="form-group">
                    <label>Price *</label>
                    <Field name="price" type="number" className="input-field" />
                    <ErrorMessage name="price" component="div" className="error-msg" />
                  </div>
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <Field as="textarea" name="description" className="input-field" />
                </div>

                <div className="grid-two-columns">
                  <div className="form-group">
                    <label>Image URL</label>
                    <Field name="image" className="input-field" />
                  </div>

                  <div className="form-group">
                    <label>Category *</label>
                    {loadingCategories ? (
                      <div className="input-field">Loading...</div>
                    ) : (
                      <Field as="select" name="categoryId" className="input-field">
                        <option value="">Select category</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </Field>
                    )}
                    <ErrorMessage name="categoryId" component="div" className="error-msg" />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? "Adding..." : "Add Product"}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </section>
  );
}
