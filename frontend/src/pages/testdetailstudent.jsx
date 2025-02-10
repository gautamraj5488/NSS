import React from 'react';
import { useLocation } from 'react-router-dom';
import './testdetailstudent.css';
import { useAuth } from './user_data';

const TestReviewStudent = () => {
  const location = useLocation();
  const test = location.state;
  const { userData, loading } = useAuth(); 
  if (loading) {
    return <div className="container">Loading...</div>;
  }

  if (!test) {
    return <div className="container">Test not found</div>;
  }

  // Find the student record
  const studentRecord = test.students.find(student => student.userId === userData.id);
  if (!studentRecord) {
    return <div className="container">No records found for this user.</div>;
  }

  // Count total number of questions
  const totalQuestions = test.subjects.reduce((total, subject) => total + subject.questions.length, 0);
  let totalScore = 0;

  return (
    <div className="test-results-container">
      <div className="header">
        <h1>{test.testTitle}</h1>
        <span className="total-marks">Total Marks: {studentRecord.totalMarks}/{totalQuestions*test.mark_question}</span>
      </div>

      <div className="test-meta">
        <p>Date: {new Date(test.examDate).toLocaleDateString()}</p>
        <p>Duration: {test.duration} hours</p>
        <p>Marking Scheme: {test.mark_question} marks per question</p>
        <p>Total Questions: {totalQuestions}</p>
      </div>

      {test.subjects.map((subject, subjectIndex) => (
        <div key={subjectIndex} className="subject-section">
          <h2>{subject.name}</h2>
          {subject.questions.map((question, questionIndex) => {
  const qtype = question.questionType; 
  let studentAnswer = studentRecord.studentAnswer?.[subjectIndex]?.[questionIndex] || "No Answer";
  let correctAnswerDisplay = question.correctAnswer;
  let isCorrect = false;
 
  console.log(studentAnswer)
  console.log(qtype);

  if (qtype === "integer" && studentAnswer !== "No Answer") {
    isCorrect = parseFloat(studentAnswer) === parseFloat(correctAnswerDisplay);
  } else if (qtype === "moptions" && studentAnswer !== "No Answer") {
    // Multi-correct case
    const studentSet = new Set(studentAnswer.split("").map(num => String.fromCharCode(65 + parseInt(num))));
    const correctSet = new Set(correctAnswerDisplay.split("").map(num => String.fromCharCode(64 + parseInt(num))));
    isCorrect = studentSet.size === correctSet.size && [...studentSet].every(answer => correctSet.has(answer));
  
    studentAnswer = [...studentSet].join(", ");
    correctAnswerDisplay = [...correctSet].join(", ");
  } else if (qtype === "options" && studentAnswer !== "No Answer") {
    // Single-correct case (fixing the issue)
    isCorrect = parseInt(studentAnswer) + 1 === parseInt(correctAnswerDisplay);
    studentAnswer = String.fromCharCode(65 + parseInt(studentAnswer));
    correctAnswerDisplay = String.fromCharCode(64 + parseInt(question.correctAnswer));
  }

  let negativeMark = question.negativeMark || 0;
  if (studentAnswer === "No Answer") {
    negativeMark = 0;
  }
 
  const questionScore = isCorrect ? test.mark_question : -negativeMark;
  totalScore += questionScore;
  return (
    <div key={questionIndex} className={`question-card ${isCorrect ? "correct-answer" : "wrong-answer"}`}>
      <div className="question-header">
        <h3>Question {questionIndex + 1}</h3>
        <span className="question-type">
          ({question.options && question.options.length > 0 ? "Multiple Choice" : "Integer Answer"})
        </span>
      </div>
      <p className="question-text">{question.question}</p>
      {question.image && (
        <div className="question-image">
          <img src={question.image} alt="Question visual" />
        </div>
      )}
      {question.options && question.options.length > 0 ? (
        <div className="options-container">
          <h4>Options:</h4>
          <div className="options-grid">
          {question.options.map((option, optionIndex) => {
  const optionLetter = String.fromCharCode(65 + optionIndex);
  const isStudentAnswer = studentAnswer.includes(optionLetter);
  const isCorrectOption = correctAnswerDisplay.includes(optionLetter);

  return (
    <div
      key={optionIndex}
      className={`option 
        ${isStudentAnswer ? (isCorrectOption ? "correct" : "incorrect") : ""}
        ${isCorrectOption && !isStudentAnswer ? "correct-answer" : ""}
      `}
    >
      {optionLetter}. {option}
    </div>
  );
})}

          </div>
        </div>
      ) : (
        <div className="integer-answer">
          <h4>Correct Answer:</h4>
          <div className="answer-box">{correctAnswerDisplay}</div>
        </div>
      )}

      <div className="student-answer">
        <h4>Your Answer:</h4>
        <div className={`answer-box ${isCorrect ? "correct" : "incorrect"}`}>
          {studentAnswer}
        </div>
        <p>Status: {isCorrect ? "Correct" : "Incorrect"}</p>
        <p>Marks: {questionScore}</p>
      </div>
    </div>
  );
})}

        </div>
      ))}
    </div>
  );
};

export default TestReviewStudent;