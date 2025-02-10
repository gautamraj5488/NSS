import React, { useState } from "react";
import "./Signup.css";
import { useAuth } from "./user_data";
import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaLock, FaEnvelope, FaCheck, FaExclamationCircle } from "react-icons/fa";

const register = async (url, payload) => {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Something went wrong");
    }
    return await response.json();
  } catch (error) {
    throw new Error(error.message || "Network error");
  }
};

const login = async (url, payload) => {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Something went wrong");
    }
    return await response.json();
  } catch (error) {
    throw new Error(error.message || "Network error");
  }
};

const Signup = () => {
  const { getit } = useAuth();
  const navigate = useNavigate();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const data = await register("http://localhost:8000/signup", { name, email, password });
      data.user.id = email;
      getit(data.token, data.user);
      setSuccess("Account created successfully! Redirecting to Home...");
      setTimeout(() => navigate("/home", { replace: true }), 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const data = await login("http://localhost:8000/login", { email: loginEmail, password: loginPassword });
      data.user.id = loginEmail;
      getit(data.token, data.user);
      setSuccess("Login successful! Redirecting to Home...");
      setTimeout(() => navigate("/home", { replace: true }), 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="parent-container">
      <div className="container">
      <div className="form-wrapper">
        <form onSubmit={handleSignup} className="form signup-form">
          <h1>Create Account</h1>
          <div className="input-group">
            {/* <FaUser className="input-icon" /> */}
            <input type="text" placeholder=" Name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="input-group">
            {/* <FaEnvelope className="input-icon" /> */}
            <input type="email" placeholder=" Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="input-group">
            {/* <FaLock className="input-icon" /> */}
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {error && (
            <div className="message error">
              <FaExclamationCircle /> {error}
            </div>
          )}
          {success && (
            <div className="message success">
              <FaCheck /> {success}
            </div>
          )}
          <button type="submit" className="btn-primary">Sign Up</button>
          <p className="toggle-form">
            Already have an account? 
            <button type="button" className="text-link">Sign In</button>
          </p>
        </form>

        <div className="divider"></div>

        <form onSubmit={handleLogin} className="form login-form">
          <h1>Welcome Back</h1>
          <div className="input-group">
            {/* <FaEnvelope className="input-icon" /> */}
            <input type="email" placeholder="Email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
          </div>
          <div className="input-group">
            {/* <FaLock className="input-icon" /> */}
            <input type="password" placeholder="Password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
          </div>
          {error && (
            <div className="message error">
              <FaExclamationCircle /> {error}
            </div>
          )}
          {success && (
            <div className="message success">
              <FaCheck /> {success}
            </div>
          )}
          <button type="submit" className="btn-primary">Sign In</button>
          <button type="button" className="btn-ghost" onClick={() => navigate("/admin-login")}>
            Admin Login
          </button>
          <p className="toggle-form">
            New here? 
            <button type="button" className="text-link">Create Account</button>
          </p>
        </form>
      </div>
    </div>

    </div>
    
  );
};

export default Signup;