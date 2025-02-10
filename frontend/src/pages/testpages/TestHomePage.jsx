import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FiClock,
  FiCalendar,
  FiBook,
  FiAlertTriangle,
  FiCheckCircle
} from "react-icons/fi";
import "./TestHomePage.css";

function convertDecimalTimeTo12Hour(decimalTime) {
  const hours24 = Math.floor(decimalTime);
  const minutesDecimal = decimalTime - hours24;
  const minutes = Math.round(minutesDecimal * 60);
  const period = hours24 >= 12 ? "PM" : "AM";
  let hours12 = hours24 % 12 || 12;

  return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
}

const TestDetails = () => {
  const [checked, setChecked] = useState(false);
  const location = useLocation();
  const [isTimeValid, setIsTimeValid] = useState(false);
  const [timeError, setTimeError] = useState("");
  const test = location.state;
  const navigate = useNavigate();

  useEffect(() => {
    const calculateTimeValidity = () => {
      const now = new Date();
      const examDate = new Date(test.examDate);
      const startHours = Math.floor(test.start_time);
      const startMinutes = Math.round((test.start_time - startHours) * 60);
      const startTime = new Date(
        examDate.getFullYear(),
        examDate.getMonth(),
        examDate.getDate(),
        startHours,
        startMinutes
      );

      const endTime = new Date(startTime.getTime() + (test.duration * 60 * 60 * 1000));

      if (now < startTime) {
        setTimeError(`Test will be available at ${convertDecimalTimeTo12Hour(test.start_time)}`);
        setIsTimeValid(false);
      } else if (now > endTime) {
        setTimeError("This test has already ended");
        setIsTimeValid(false);
      } else {
        setTimeError("");
        setIsTimeValid(true);
      }
    };

    calculateTimeValidity();
    const interval = setInterval(calculateTimeValidity, 1000);
    return () => clearInterval(interval);
  }, [test]);

  const handleStartTest = (e) => {
    if (!isTimeValid) {
      e.preventDefault();
      alert(timeError || "Test is not available at this time");
    } else if (checked) {
      navigate(`/test/${test._id}/start`, { state: test, replace: true });
    }
  };

  const examDate = new Date(test.examDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="test-details-container">
      {/* Header */}
      <div className="test-header">
        <h1 className="test-title">{test.testTitle || "Test Title"}</h1>
        <div className="exam-meta">
          <div className="meta-item">
            <FiCalendar className="meta-icon" />
            <span className="meta-label">Date:</span>
            <span className="meta-value">{examDate}</span>
          </div>
          <div className="meta-item">
            <FiClock className="meta-icon" />
            <span className="meta-label">Duration:</span>
            <span className="meta-value">
              {convertDecimalTimeTo12Hour(test.start_time)} - {convertDecimalTimeTo12Hour(test.start_time + test.duration)}
            </span>
          </div>
        </div>
      </div>


      <div className="content-wrapper">
        {/* Exam Details */}
        <div className="details-section">
          <div className="info-card">
            <h2><FiBook className="section-icon" /> Exam Details</h2>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Duration:</span>
                <span className="detail-value">{test.duration} Hours</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Marks per Question:</span>
                <span className="detail-value">{test.mark_question}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Negative Marking:</span>
                <span className="detail-value negative">
                  <FiAlertTriangle /> Enabled
                </span>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="info-card instructions">
            <h2><FiAlertTriangle className="section-icon" /> Instructions</h2>
            <div className="instruction-list">
              <div className="instruction-item">
                <div className="instruction-number">1</div>
                <p>Read all questions carefully before answering.</p>
              </div>
              <div className="instruction-item">
                <div className="instruction-number">2</div>
                <p>Ensure a stable internet connection throughout the exam.</p>
              </div>
              <div className="instruction-item">
                <div className="instruction-number">3</div>
                <p>No external resources or assistance allowed.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Confirmation & Start Button */}
        <div className="action-section">
          <div className="confirmation-box">
            {isTimeValid ? (
              <>
                <label className="checkbox-container"><input type="checkbox" checked={checked} onChange={() => setChecked(!checked)} /><span className="checkmark"></span><span className="confirmation-text">I confirm that I'm ready to start the test</span></label>



                <button
                  className={`start-button ${checked ? 'active' : 'disabled'}`}
                  disabled={!checked}
                  onClick={handleStartTest}
                >
                  Start Test Now
                </button>
              </>
            ) : (
              <div className="time-message">
                <FiClock className="message-icon" />
                {timeError}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestDetails;
