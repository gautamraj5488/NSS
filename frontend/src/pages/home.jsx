import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Axios from "axios";
import TopBar from "../components/topbar";
import "./home.css";
import { FiClock, FiCalendar, FiCheckCircle, FiXCircle, FiBook } from "react-icons/fi";
import { useAuth } from "./user_data";


function convertDecimalTimeTo12Hour(decimalTime) {
  // Ensure the time wraps around correctly if it exceeds 24 hours
  const totalHours = decimalTime % 24;
  const hours24 = Math.floor(totalHours);
  const minutes = Math.round((totalHours - hours24) * 60);
  const period = hours24 >= 12 ? "PM" : "AM";
  let hours12 = hours24 % 12 || 12; // Convert to 12-hour format
  return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
}
const EventItem = ({ testdata,userData,activeTab }) => {
  const navigate = useNavigate();
  const examDate2 = new Date(testdata.examDate);

  console.log(activeTab);
  console.log(testdata);
  
  // Calculate the test's start time (combine examDate and start_time)
  const startHours = Math.floor(testdata.start_time);
  const startMinutes = (testdata.start_time - startHours) * 60;
  const startTime = new Date(
    examDate2.getFullYear(),
    examDate2.getMonth(),
    examDate2.getDate(),
    startHours,
    startMinutes
  );

  // Calculate end time (start time + duration in hours)
  const durationMs = testdata.duration * 60 * 60 * 1000;
  const endTime = new Date(startTime.getTime() + durationMs);
  
  const examDate = new Date(testdata.examDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const isPastTest = testdata.givenby && testdata.givenby.some((user) => user.userId === userData.id);
  const studentRecord = testdata.students.find(student => student.userId === userData.id);
  const totalQuestions = testdata.subjects.reduce((total, subject) => total + subject.questions.length, 0);
  
  


  const handleTestClick = () => {
    if(activeTab!="upcoming"){
      navigate(`/test/${testdata._id}/testreview`, { state: testdata });
    }else{
      const now = new Date();
      const fiveMinutesBefore = new Date(startTime.getTime() - 5 * 60 * 1000);
      if (now >= fiveMinutesBefore && now <= endTime) {
        activeTab === "upcoming" ? navigate(`/test/${testdata._id}`, { state: testdata }) :navigate(`/test/${testdata._id}/testreview`, { state: testdata });
      } else if (now < fiveMinutesBefore) {
        alert("Test is not available yet. You can access it 5 minutes before the start time.");
      } else {
        alert("This test has already ended.");
      }

    }
   
  };

  return (
    <div className="task-box">
      {isPastTest ? (
        <div className="description-task">
          <div className="exam-meta">
            <div className="exam-date">
              <FiCalendar className="meta-icon" />
              {examDate}
            </div>
            <div className="exam-time">
              <FiClock className="meta-icon" />
              {convertDecimalTimeTo12Hour(testdata.start_time)} - {convertDecimalTimeTo12Hour(testdata.start_time + testdata.duration)}
            </div>
          </div>
          <div className="task-name">{testdata.testTitle}</div>
          <div className="exam-details">
            <div className="detail-item">
              <FiClock className="detail-icon" />
              <span>{testdata.duration} Hours</span>
            </div>
            {activeTab == "upcoming" ? (
            <>
              <div className="detail-item">
                <FiBook className="detail-icon" />
                <span>{testdata.mark_question} Marks/Question</span>
              </div>
              <div className="detail-item">
                <FiCheckCircle className="detail-icon negative-mark yes" />
                <span>Negative Marking</span>
              </div>
            </>
          ) : (
            <div className="detail-item">
              <FiBook className="detail-icon" />
              <span>Total Marks: {studentRecord.totalMarks}/{totalQuestions * testdata.mark_question}</span>
            </div>
          )}
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${Math.random() * 100}%` }}></div>
          </div>
        </div>
      ) : (
        <div className="description-task" onClick={handleTestClick} style={{ cursor: 'pointer' }}>
          <div className="exam-meta">
            <div className="exam-date">
              <FiCalendar className="meta-icon" />
              {examDate}
            </div>
            <div className="exam-time">
              <FiClock className="meta-icon" />
              {convertDecimalTimeTo12Hour(testdata.start_time)} - {convertDecimalTimeTo12Hour(testdata.start_time + testdata.duration)}
            </div>
          </div>
          <div className="task-name">{testdata.testTitle}</div>
          <div className="exam-details">
            <div className="detail-item">
              <FiClock className="detail-icon" />
              <span>{testdata.duration} Hours</span>
            </div>
            <div className="detail-item">
              <FiBook className="detail-icon" />
              <span>{testdata.mark_question} Marks/Question</span>
            </div>
            <div className="detail-item">
              <FiCheckCircle className="detail-icon negative-mark yes" />
              <span>Negative Marking</span>
            </div>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${Math.random() * 100}%` }}></div>
          </div>
        </div>
      )}
    </div>
  );
};


const SimpleButton = ({ label, onClick }) => (
  <button className="simple-button" onClick={onClick}>
    {label}
  </button>
);

const Home = () => {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [tests, setTests] = useState([]);
  const navigate = useNavigate();
  const { userData,loading } = useAuth();



  useEffect(() => {
    const fetchTests = async () => {
      try {
        const response = await Axios.get("http://localhost:8000/get-test");
        setTests(response.data);
      } catch (error) {
        console.error("Error fetching test data:", error);
      }
    };
    fetchTests();
  }, []);

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  // Handle case where userData is null (user not authenticated)
  if (!userData) {
    return <div className="container">Please log in to view this page.</div>;
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/signup");
  };
  const upcomingTests = tests.filter((test) => {
    // Combine examDate and start_time to calculate the correct start time
    const examDate = new Date(test.examDate);
    const startHours = Math.floor(test.start_time);
    const startMinutes = (test.start_time - startHours) * 60;
    const startTime = new Date(
      examDate.getFullYear(),
      examDate.getMonth(),
      examDate.getDate(),
      startHours,
      startMinutes
    );
    console.log(userData.id);
    // Calculate endTime by adding duration (in milliseconds)
    const durationMs = test.duration * 60 * 60 * 1000;
    const endTime = new Date(startTime.getTime() + durationMs);
  
    // Check if the test is upcoming and not taken by the user
    const isGivenByUser = test.givenby && test.givenby.some((user) => user === userData.id);
    return endTime > Date.now() && !isGivenByUser;
  });
  const pastTests = tests.filter((test) => {
    return test.givenby && test.givenby.some((user) => user === userData.id);
  });
  const tasks = activeTab === "upcoming" ? upcomingTests : pastTests;

 
  return (
    <div className="home-container full-screen">
      {/* <TopBar /> */}
      <div className="main-content">
        <div className="header-section">
          <h1 className="main-header">Dashboard</h1>
          <div className="button-group">
            {/* <SimpleButton label="Create Test" onClick={() => navigate(`/testmaker`)} /> */}
            <SimpleButton label="Logout" onClick={handleLogout} />
          </div>
        </div>
        <div className="tabs-container">
          <button className={`tab ${activeTab === "upcoming" ? "active" : ""}`} onClick={() => setActiveTab("upcoming")}>
            Upcoming Tests
          </button>
          <button className={`tab ${activeTab === "past" ? "active" : ""}`} onClick={() => setActiveTab("past")}>
            Past Tests
          </button>
        </div>
        <div className="tasks-grid">
          {tasks.length > 0 ? (
            tasks.map((task, index) => <EventItem key={index} testdata={task} userData={userData} activeTab={activeTab} />)
          ) : (
            <p className="no-tasks">No tests available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;