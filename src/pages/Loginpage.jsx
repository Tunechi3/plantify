import React, { useState, useContext } from "react";
import {
  FaFacebookF,
  FaGoogle,
  FaLinkedinIn,
  FaEnvelope,
  FaLock,
} from "react-icons/fa";
import "../Loginpage.css";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { UserContext } from "../components/UserContext"; // UserContext import

const passwordRules =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+={}[\]|\\:;"'<>,.?/]).{8,}$/;

const loginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().required("Password is required"),
});

const signupSchema = Yup.object().shape({
  fullname: Yup.string().required("Full name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .matches(
      passwordRules,
      "Password must be 8+ chars and include uppercase, lowercase, number & special char"
    )
    .required("Password is required"),
  confirm: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Confirm your password"),
});

const calcStrength = (pwd) => {
  if (!pwd) return { pct: 0, color: "#e53935" };
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;

  const pct = Math.min(100, Math.round((score / 4) * 100));
  let color = "#e53935";
  if (score >= 4) color = "#16a34a";
  else if (score >= 2) color = "#f59e0b";

  return { pct, color };
};

const Loginpage = () => {
  const [isLogin, setIsLogin] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(UserContext); // UserContext

  return (
    <div className={`auth-container ${isLogin ? "login-mode" : ""}`}>
      {/* LEFT PANEL */}
      <div className="panel left-panel">
        {!isLogin ? (
          <>
            <h2>Welcome Back!</h2>
            <p>Please keep connected with us, please login with your details</p>
            <button
              className="panel-btn"
              onClick={() => setIsLogin(true)}
              type="button"
            >
              Login
            </button>
          </>
        ) : (
          <Formik
            initialValues={{ email: "", password: "" }}
            validationSchema={loginSchema}
            onSubmit={async (values, { setSubmitting }) => {
              try {
                // LOGIN BACKEND
                await axios.post(
                  "http://localhost:3000/api/users/login-user",
                  values
                );

                // Update UserContext
                login();

                // Show toast and navigate after toast closes
                toast.success("Login successful!", {
                  onClose: () => navigate("/"), // redirect
                  autoClose: 1000,
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
                    type="password"
                    placeholder="Password"
                    className="styled-field"
                  />
                </div>
                <ErrorMessage
                  name="password"
                  component="div"
                  className="error-msg"
                />

                <button className="submit-btn" type="submit">
                  Login
                </button>

                <button
                  type="button"
                  className="forgot-pass"
                  onClick={() => alert("Trigger forgot password flow")}
                >
                  Forgot Password?
                </button>
              </Form>
            )}
          </Formik>
        )}
      </div>

      {/* RIGHT PANEL */}
      <div className="panel right-panel">
        {isLogin ? (
          <>
            <h2>Hello, Friend!</h2>
            <p>Enter your personal details and start your journey with us</p>
            <button
              className="panel-btn"
              onClick={() => setIsLogin(false)}
              type="button"
            >
              Sign Up
            </button>
          </>
        ) : (
          <Formik
            initialValues={{
              fullname: "",
              email: "",
              password: "",
              confirm: "",
            }}
            validationSchema={signupSchema}
            onSubmit={async (values, { setSubmitting, resetForm }) => {
              try {
                // SIGN-UP BACKEND
                await axios.post(
                  "http://localhost:3000/api/users/register-user",
                  {
                    fullname: values.fullname,
                    email: values.email,
                    password: values.password,
                  }
                );

                toast.success("Signup successful!");
                resetForm();
                setIsLogin(true); // switch to login
              } catch (error) {
                toast.error(error.response?.data?.message || "Signup failed.");
              }

              setSubmitting(false);
            }}
          >
            {(formik) => {
              const pwd = formik.values.password || "";
              const strength = calcStrength(pwd);

              return (
                <Form className="form-box">
                  <h2 style={{ marginTop: "8px" }}>Create Account</h2>

                  <div className="input-group">
                    <FaEnvelope className="input-icon" />
                    <Field
                      name="fullname"
                      type="text"
                      placeholder="Full Name"
                      className="styled-field"
                    />
                  </div>
                  <ErrorMessage
                    name="fullname"
                    component="div"
                    className="error-msg"
                  />

                  <div className="input-group">
                    <FaEnvelope className="input-icon" />
                    <Field
                      name="email"
                      type="email"
                      placeholder="Email"
                      className="styled-field"
                    />
                  </div>
                  <ErrorMessage
                    name="email"
                    component="div"
                    className="error-msg"
                  />

                  <div className="input-group">
                    <FaLock className="input-icon" />
                    <Field
                      name="password"
                      type="password"
                      placeholder="Password"
                      className="styled-field"
                    />
                  </div>
                  <ErrorMessage
                    name="password"
                    component="div"
                    className="error-msg"
                  />

                  <div className="strength-bar" aria-hidden>
                    <div
                      className="strength-fill"
                      style={{
                        width: `${strength.pct}%`,
                        background: strength.color,
                      }}
                    />
                  </div>

                  <div className="input-group">
                    <FaLock className="input-icon" />
                    <Field
                      name="confirm"
                      type="password"
                      placeholder="Confirm Password"
                      className="styled-field"
                    />
                  </div>
                  <ErrorMessage
                    name="confirm"
                    component="div"
                    className="error-msg"
                  />

                  <button className="submit-btn" type="submit">
                    Register
                  </button>
                </Form>
              );
            }}
          </Formik>
        )}
      </div>
    </div>
  );
};

export default Loginpage;
