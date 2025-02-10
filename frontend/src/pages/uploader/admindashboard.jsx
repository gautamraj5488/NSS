import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./admindashboard.css";
import Axios from "axios";
import { Link } from "react-router-dom";

function convertDecimalTimeTo12Hour(decimalTime) {
  const hours24 = Math.floor(decimalTime);
  const minutesDecimal = decimalTime - hours24;
  const minutes = Math.round(minutesDecimal * 60);
  const period = hours24 >= 12 ? "PM" : "AM";
  let hours12 = hours24 % 12;
  if (hours12 === 0) hours12 = 12;
  return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
}

const EventItem = ({ testdata, isPast  }) => {
  const linkPath = isPast 
  ? `/admin/${testdata._id}/result`
  : `/admin/upcoming/${testdata._id}`;
  return (
    <div className="test-card">
       <Link  to={
       linkPath
      } state = {{ test:testdata }} 
      >
        <div className="test-content">
          <div className="test-time">
            {new Date(testdata.examDate).toLocaleDateString()} • 
            {convertDecimalTimeTo12Hour(testdata.start_time)} - 
            {convertDecimalTimeTo12Hour(testdata.start_time + testdata.duration)}
          </div>
          <h3>{testdata.testTitle}</h3>
          <p>Duration: {testdata.duration} hours</p>
        </div>
      </Link>
    </div>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [upcomingTests, setUpcomingTests] = useState([]);
  const [pastTests, setPastTests] = useState([]);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const response = await Axios.get("http://localhost:8000/get-test");
        const now = new Date();
        
        const upcoming = [];
        const past = [];

        response.data.forEach(test => {
          const examDate = new Date(test.examDate);
          const startHours = Math.floor(test.start_time);
          const startMinutes = (test.start_time - startHours) * 60;
          const startDateTime = new Date(examDate);
          startDateTime.setHours(startHours, startMinutes);
          
          const endDateTime = new Date(startDateTime.getTime() + test.duration * 60 * 60 * 1000);
          
          endDateTime < now ? past.push(test) : upcoming.push(test);
        });

        setUpcomingTests(upcoming);
        setPastTests(past);
      } catch (error) {
        console.error("Error fetching test data:", error);
      }
    };

    fetchTests();
  }, []);

  const handleCreateTest = () => navigate("/admin/create-test");

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <div className="sections-container">
        <div className="upcoming-section">
          <h2>Upcoming Tests ({upcomingTests.length})</h2>
          <div className="test-list">
            {upcomingTests.length > 0 ? (
              upcomingTests.map((test, index) => (
                <EventItem key={index} testdata={test} isPast={false} />
              ))
            ) : (
              <p className="no-tests">No upcoming tests scheduled</p>
            )}
          </div>
          <button className="create-test-btn" onClick={handleCreateTest}>
             Create New Test
          </button>
        </div>

        <div className="past-section">
          <h2>Past Tests ({pastTests.length})</h2>
          <div className="test-list">
            {pastTests.length > 0 ? (
              pastTests.map((test, index) => (
                <EventItem key={index} testdata={test} isPast={true} />
              ))
            ) : (
              <p className="no-tests">No past tests available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;