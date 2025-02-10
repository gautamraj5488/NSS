import React from "react";
import { useNavigate, Link } from "react-router-dom";
import "./UpcomingTextPage.css";

const UpcomingTestsPage = () => {
  return (
    <div className="Header">
      <div className="Header-content">
        <div className="Header-hero">
          <h1>The best platform to <br/>practice test</h1>
          <p>IIT-JEE/NEET Test Platform</p>
          <Link to="/signup">
            <button className="Button">Sign up</button>
          </Link>
        </div>
        <div className="Header-visuals">
          <div className="Iphone"></div>
        </div>
      </div>
    </div>
  );
};

export default UpcomingTestsPage;