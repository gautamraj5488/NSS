import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './TestDetails.css'; // Ensure this CSS file exists

const TestPreview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const test = location.state?.test;

  if (!test) {
    return <div className="container">Test not found</div>;
  }

  const handleEditQuestion = (subjectIndex, questionIndex) => {
    navigate(`/admin/edit-question/${test._id}`, {
      state: { test, subjectIndex, questionIndex },
    });
  };

  return (
    <div className="container2">
      <h1>{test.testTitle}</h1>
      <div className="test-meta">
        <p>Date: {new Date(test.examDate).toLocaleDateString()}</p>
        <p>Duration: {test.duration} hours</p>
        <p>Marking Scheme: {test.mark_question} marks per question</p>
      </div>

      {test.subjects.map((subject, subjectIndex) => (
        <div key={subjectIndex} className="subject-section">
          <h2>{subject.name}</h2>

          {subject.questions.map((question, questionIndex) => {
            const isMultiOption = question.questionType === "moptions";
            const isSOption = question.questionType === "options";
            let isCorrect = false;
            let selectedOptions = new Set();
            let correctOptions = new Set();

            if (isMultiOption || isSOption) {
              // Convert correct answer (1-indexed) to a sorted Set
              correctOptions = new Set([...question.correctAnswer].map(Number));

              // Convert user answer (0-indexed) to a sorted Set (1-indexed)
              if (question.studentAnswer) {
                selectedOptions = new Set([...question.studentAnswer].map(num => Number(num) + 1));
              }

              // Compare sets
              isCorrect = JSON.stringify([...correctOptions].sort()) === JSON.stringify([...selectedOptions].sort());
            }

            return (
              <div key={questionIndex} className={`question-card ${isCorrect ? "correct-answer" : "wrong-answer"}`}>
                <div className="question-header">
                  <h3>Question {questionIndex + 1}</h3>
                  <span className="question-type">
                    ({question.options && question.options.length > 0 ? 
                      (isMultiOption ? "Multiple Correct Options" : "Multiple Choice") 
                      : "Integer Answer"})
                  </span>
                  
                </div>

                <p className="question-text">{question.question}</p>

                {question.image && (
                  <div className="question-image">
                    <img src={question.image} alt="Question visual" />
                  </div>
                )}

                {/* Options Rendering */}
                {question.options && question.options.length > 0 ? (
                  <div className="options-container">
                    <h4>Options:</h4>
                    <div className="options-grid">
                      {question.options.map((option, optionIndex) => {
                        let optionClass = "";
                        if (isMultiOption) {
                          if (selectedOptions.has(optionIndex + 1) && correctOptions.has(optionIndex + 1)) {
                            optionClass = "correct"; // Correct selection
                          } else if (selectedOptions.has(optionIndex + 1)) {
                            optionClass = "incorrect"; // Incorrect selection
                          } else if (correctOptions.has(optionIndex + 1)) {
                            optionClass = "missed"; // Correct answer not selected
                          }
                        }

                        return (
                          <div key={optionIndex} className={`option ${optionClass}`}>
                            {String.fromCharCode(65 + optionIndex)}. {option}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="integer-answer">
                    <h4>Correct Answer:</h4>
                    <div className="answer-box">{question.correctAnswer}</div>
                  </div>
                )}

                {/* Correct Answer Display for Multi-Option */}
       {(isMultiOption || isSOption) && (
          <div className="correct-answer">
            <h4>Correct Answer:</h4>
            <div className="answer-box">{[...correctOptions].join(", ")}</div>
          </div>
        )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default TestPreview;
