import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./result.css";

const ResultScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { mark_question,subjectMarks, totalMarks, totalQuestions, userId, testId, userName, selectedAnswers, questionStatus } = location.state;
  console.log(selectedAnswers);

  useEffect(() => {
    const saveStudentResult = async () => {
      try {
        const transformedAnswers = selectedAnswers.map(subject =>
          subject.map(answerArray => (Array.isArray(answerArray) ? answerArray.join('') : answerArray))
        );
        const response = await fetch(`http://localhost:8000/test/${testId}/result`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            userName,
            subjectMarks,
            totalMarks,
            testId,
            selectedAnswers:transformedAnswers,
            questionStatus,
            testQuestions: location.state.testQuestions,
          }),
        });
        if (!response.ok) {
          throw new Error("Failed to save student result");
        }
        console.log("Student result saved successfully.");
      } catch (error) {
        console.error("Error saving student result:", error);
      }
    };

    saveStudentResult();

    // Handle back button press
    const handlePopState = () => {
      navigate("/home", { replace: true }); // Replace current history entry with home
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [navigate, userId, userName, subjectMarks, totalMarks, testId]);

  const handleGoHome = () => {
    navigate("/home", { replace: true }); // Replace current history entry with home
  };

  const handleReviewTest = () => {
    navigate(`/test/${testId}/testreview`, { state: location.state, replace: true }); // Replace current history entry with test review
  };

  return (
    <div className="result-screen">
      <div className="result-card">
        <h1>Test Results</h1>
        <table className="result-table">
          <thead>
            <tr>
              <th>Subject</th>
              <th>Marks</th>
              <th>Total Questions</th>
            </tr>
          </thead>
          <tbody>
            {subjectMarks.map((subject, index) => (
              <tr key={index}>
                <td>{subject.subjectName}</td>
                <td>{subject.mark}</td>
                <td>{subject.totalQuestions}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="result-summary">
          <p>
            <strong>Total Marks:</strong> {totalMarks} / {totalQuestions * mark_question}
          </p>
        </div>
        <div className="result-actions">
          <button onClick={handleGoHome}>🏠 Home</button>
          {/* <button className="review-btn" onClick={handleReviewTest}>🔄 Review Test</button> */}
        </div>
      </div>
    </div>
  );
};

export default ResultScreen;