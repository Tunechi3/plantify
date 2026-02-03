import React, { useState, useContext } from "react";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import "../Loginpage.css";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { UserContext } from "../components/UserContext";
import { useDispatch, useSelector } from "react-redux";
import { syncGuestCart, fetchUserCart } from "../app/cartSlice";
import API_URL from "../config";
import Navbar from "../components/Navbar";

const loginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().required("Password is required"),
});

const signupSchema = Yup.object().shape({
  fullname: Yup.string().required("Full name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().required("Password is required"),
  confirm: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Confirm your password"),
});

const Loginpage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(UserContext);
  const dispatch = useDispatch();
  const guestCart = useSelector((state) => state.cart.items);

  return (
    <>
    <Navbar/>
    <div className={`auth-container ${isLogin ? "login-mode" : ""}`}>
      {/* LEFT PANEL - LOGIN */}
      <div className="panel left-panel">
        {isLogin ? (
          <Formik
            initialValues={{ email: "", password: "" }}
            validationSchema={loginSchema}
            onSubmit={async (values, { setSubmitting }) => {
              try {
                const res = await axios.post(
                  `${API_URL}/api/users/login-user`,
                  values
                );

                const { token } = res.data;
                localStorage.setItem("token", token);

                // Update context (this will set the auto-logout timer)
                login();

                // Amazon-style: Sync guest cart with backend if exists
                if (guestCart.length > 0) {
                  toast.info("Syncing your cart...");
                  try {
                    await dispatch(syncGuestCart({ guestCart, token })).unwrap();
                    toast.success("Cart synced successfully!");
                  } catch (syncError) {
                    console.error("Cart sync failed:", syncError);
                    await dispatch(fetchUserCart(token));
                  }
                } else {
                  await dispatch(fetchUserCart(token));
                }

                toast.success("Login successful! You'll stay logged in for 7 days.", {
                  onClose: () => navigate("/"),
                  autoClose: 2000,
                });
              } catch (error) {
                toast.error(error.response?.data?.message || "Login failed.");
              }
              setSubmitting(false);
            }}
          >
            {(formik) => (
              <Form className="form-box">
                <h2>Login</h2>

                <div className="input-group">
                  <FaEnvelope className="input-icon" />
                  <Field
                    name="email"
                    type="email"
                    placeholder="Email"
                    className="styled-field"
                  />
                </div>
                <ErrorMessage name="email" component="div" className="error-msg" />

                <div className="input-group">
                  <FaLock className="input-icon" />
                  <Field
                    name="password"
                    type={showLoginPassword ? "text" : "password"}
                    placeholder="Password"
                    className="styled-field"
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowLoginPassword((prev) => !prev)}
                  >
                    {showLoginPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                <ErrorMessage
                  name="password"
                  component="div"
                  className="error-msg"
                />

                <button className="submit-btn" type="submit" disabled={formik.isSubmitting}>
                  {formik.isSubmitting ? "Logging in..." : "Login"}
                </button>
              </Form>
            )}
          </Formik>
        ) : (
          <>
            <h2>Welcome Back!</h2>
            <p>Please login with your details</p>
            <button
              className="panel-btn"
              onClick={() => setIsLogin(true)}
              type="button"
            >
              Login
            </button>
          </>
        )}
      </div>

      {/* RIGHT PANEL - SIGNUP */}
      <div className="panel right-panel">
        {!isLogin ? (
          <Formik
            initialValues={{ fullname: "", email: "", password: "", confirm: "" }}
            validationSchema={signupSchema}
            onSubmit={async (values, { setSubmitting, resetForm }) => {
              try {
                await axios.post(
                  `${API_URL}/api/users/register-user`,
                  {
                    fullname: values.fullname,
                    email: values.email,
                    password: values.password,
                  }
                );
                toast.success("Signup successful! Please login.");
                resetForm();
                setIsLogin(true);
              } catch (error) {
                toast.error(error.response?.data?.message || "Signup failed.");
              }
              setSubmitting(false);
            }}
          >
            {(formik) => (
              <Form className="form-box">
                <h2>Create Account</h2>

                <div className="input-group">
                  <FaEnvelope className="input-icon" />
                  <Field
                    name="fullname"
                    type="text"
                    placeholder="Full Name"
                    className="styled-field"
                  />
                </div>
                <ErrorMessage name="fullname" component="div" className="error-msg" />

                <div className="input-group">
                  <FaEnvelope className="input-icon" />
                  <Field
                    name="email"
                    type="email"
                    placeholder="Email"
                    className="styled-field"
                  />
                </div>
                <ErrorMessage name="email" component="div" className="error-msg" />

                <div className="input-group">
                  <FaLock className="input-icon" />
                  <Field
                    name="password"
                    type={showSignupPassword ? "text" : "password"}
                    placeholder="Password"
                    className="styled-field"
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowSignupPassword((prev) => !prev)}
                  >
                    {showSignupPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                <ErrorMessage name="password" component="div" className="error-msg" />

                <div className="input-group">
                  <FaLock className="input-icon" />
                  <Field
                    name="confirm"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    className="styled-field"
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                <ErrorMessage name="confirm" component="div" className="error-msg" />

                <button className="submit-btn" type="submit" disabled={formik.isSubmitting}>
                  {formik.isSubmitting ? "Creating..." : "Register"}
                </button>
              </Form>
            )}
          </Formik>
        ) : (
          <>
            <h2>Hello, Friend!</h2>
            <p>Enter your details and start your journey</p>
            <button
              className="panel-btn"
              onClick={() => setIsLogin(false)}
              type="button"
            >
              Sign Up
            </button>
          </>
        )}
      </div>
    </div>
    </>
  );
};

export default Loginpage;