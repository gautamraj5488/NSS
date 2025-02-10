import React from "react";
import { useNavigate } from "react-router-dom";
import "./topbar.css"; // Create this file for styling

const TopBar = () => {
  const navigate = useNavigate();

  // Handle profile button click
  const handleProfileClick = () => {
    navigate("/profile"); // Navigate to the profile page
  };

  // Handle home button click
  const handleHomeClick = () => {
    navigate("/home"); // Navigate to the home page
  };

  return (
    <div className="top-bar">
      <button className="home-button" onClick={handleHomeClick}>
        Home
      </button>
      <button className="profile-button" onClick={handleProfileClick}>
        <img
          src="https://via.placeholder.com/30" // Replace with your profile image URL
          alt="Profile"
          className="profile-image"
        />
      </button>
    </div>
  );
};

export default TopBar;