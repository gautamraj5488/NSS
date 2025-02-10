import React from "react";
// import "./QuestionStatus.css";

const QuestionStatus = ({ questions }) => {
  return (
    <div className="question-status">
      <h4>Question Status</h4>
      <ul>
        {questions.map((status, index) => (
          <li key={index} className={`status ${status.toLowerCase()}`}>
            Question {index + 1}: {status}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default QuestionStatus;
