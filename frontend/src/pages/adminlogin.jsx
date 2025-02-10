import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Signup.css";

const AdminLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Updated fixed admin credentials
  const ADMIN_CREDENTIALS = {
    username: "NSSIITROORKEE",
    password: "NSSCIVIL"
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === ADMIN_CREDENTIALS.username && 
        password === ADMIN_CREDENTIALS.password) {
      navigate("/admin",{
       replace:true
      }); // Redirect to admin dashboard
    } else {
      setError("Invalid admin credentials");
    }
  };

  return (
      <div className="parent-container">
        <div className="form-container">
        <form onSubmit={handleLogin}>
          <h1>Admin Login</h1>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <h1> </h1>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
            <h1> </h1>

          {error && <p className="error">{error}</p>}
          <button type="submit">Login as Admin</button>
        </form>
      </div>
   

      </div>
      
  );
};

export default AdminLogin;