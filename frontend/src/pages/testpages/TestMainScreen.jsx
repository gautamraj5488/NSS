import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate, replace } from "react-router-dom";
import "./TestMainScreen.css";
import { useAuth } from "../user_data";

const TestScreen = () => {
  const { testId } = useParams(); // Fetch the testId from the URL
  const [testData, setTestData] = useState(null);
  const [currentSubject, setCurrentSubject] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionStatus, setQuestionStatus] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState([]); // 2D array to store selected answers
  const [showModal, setShowModal] = useState(false); // Modal state
  const location = useLocation();
  const { userData } = useAuth();
  const test = location.state;
  const navigate = useNavigate(); // To navigate to result screen
  const [timeLeft, setTimeLeft] = useState(0);
  const [endTime, setEndTime] = useState(null);

  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const seconds = totalSeconds % 60; // Get remaining seconds

    let timeString = [];
    if (hours > 0) timeString.push(`${hours}h`);
    if (minutes > 0 || hours === 0) timeString.push(`${minutes}m`);
    timeString.push(`${seconds}s`); // Always display seconds

    return `${timeString.join(" ")} left`;
  };

  const renderSubjectTabs = () => (
    <div className="subject-tabs">
      {test.subjects.map((subject) => (
        <button
          key={subject.name}
          className={`subject-tab ${currentSubject === subject.name ? 'active' : ''}`}
          onClick={() => {
            setCurrentSubject(subject.name);
            setCurrentQuestionIndex(0);
          }}
        >
          {subject.name}
          <span className="question-count">
            ({subject.questions.length})
          </span>
        </button>
      ))}
    </div>
  );
  const categorizeQuestions = (questions) => {
    return questions.reduce((acc, question, index) => {
      if (question.questionType === 'options') {
        acc.singleCorrect.push({ ...question, originalIndex: index });
      } else if (question.questionType === 'moptions') {
        acc.multipleCorrect.push({ ...question, originalIndex: index });
      } else if (question.questionType === 'integer') {
        acc.integerQuestions.push({ ...question, originalIndex: index });
      }
      return acc;
    }, {
      singleCorrect: [],
      multipleCorrect: [],
      integerQuestions: []
    });
  };

  // Get categorized questions for current subject
  const currentSubjectQuestions = test.subjects.find(
    subject => subject.name === currentSubject
  )?.questions || [];

  const {
    singleCorrect,
    multipleCorrect,
    integerQuestions
  } = categorizeQuestions(currentSubjectQuestions);

  useEffect(() => {
    if (test?._id && test?.duration) {
      const storedEndTime = localStorage.getItem(`testEndTime_${test._id}`);
      const now = Date.now();

      if (storedEndTime) {
        const remaining = parseInt(storedEndTime) - now;
        if (remaining > 0) {
          setTimeLeft(remaining);
          setEndTime(parseInt(storedEndTime));
        } else {
          confirmSubmitTest();
        }
      } else {
        // Convert decimal hours to milliseconds
        const durationMs = test.duration * 60 * 60 * 1000;
        const newEndTime = now + durationMs;
        localStorage.setItem(`testEndTime_${test._id}`, newEndTime.toString());
        setEndTime(newEndTime);
        setTimeLeft(durationMs);
      }
    }
  }, [test]);

  useEffect(() => {
    if (!endTime) return;

    const timerInterval = setInterval(() => {
      const now = Date.now();
      const remaining = endTime - now;

      if (remaining <= 0) {
        clearInterval(timerInterval);
        confirmSubmitTest();
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [endTime]);

  useEffect(() => {
    if (selectedAnswers.length > 0 && test?._id) {
      localStorage.setItem(
        `testAnswers_${test._id}`,
        JSON.stringify(selectedAnswers)
      );
    }
  }, [selectedAnswers, test?._id]);


  useEffect(() => {
    if (questionStatus.length > 0 && test?._id) {
      localStorage.setItem(
        `testStatus_${test._id}`,
        JSON.stringify(questionStatus)
      );
    }
  }, [questionStatus, test?._id]);

  useEffect(() => {
    const loadSavedAnswers = () => {
      if (test?._id) {
        const savedAnswers = localStorage.getItem(`testAnswers_${test._id}`);
        if (savedAnswers) {
          setSelectedAnswers(JSON.parse(savedAnswers));
        }
        const savedStatus = localStorage.getItem(`testStatus_${test._id}`);
        if (savedStatus) {
          setQuestionStatus(JSON.parse(savedStatus));
        }
      }
    };
    // Assuming test data is passed from the previous screen (state)
    if (test && test.subjects && test.subjects.length > 0) {
      setTestData(test);
      setCurrentSubject(test.subjects[0].name); // Set first subject as default
    }
    const savedStatus = localStorage.getItem(`testStatus_${test._id}`);
    if (savedStatus) {
      setQuestionStatus(JSON.parse(savedStatus));
    } else {
      // Initialize the question status array with 0 (unattempted)
      const initialStatus =
        test.subjects?.map((subject) =>
          Array(subject.questions.length).fill(0)
        ) || []; // Fallback to an empty array if subjects is undefined

      setQuestionStatus(initialStatus);
    }

    // Initialize selectedAnswers with null (no answer selected)
    const savedAnswers = localStorage.getItem(`testAnswers_${test._id}`);
    if (savedAnswers) {
      setSelectedAnswers(JSON.parse(savedAnswers));
    } else {
      const initialAnswers = test.subjects?.map((subject) =>
        Array(subject.questions.length).fill(null)
      );
      setSelectedAnswers(initialAnswers);
    }

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [testId, test]);

  if (!testData) return <div>Loading...</div>;

  const questions = test.subjects.find(
    (subject) => subject.name === currentSubject
  ).questions;
  const currentQuestion = questions[currentQuestionIndex];

  const handleMultiSelect = (originalIndex, optionIndex, isChecked) => {
    const updatedAnswers = [...selectedAnswers];
    const subjectIndex = test.subjects.findIndex(
      subject => subject.name === currentSubject
    );

    const currentAnswers = updatedAnswers[subjectIndex][originalIndex] || [];

    if (isChecked) {
      updatedAnswers[subjectIndex][originalIndex] = [...currentAnswers, optionIndex];
    } else {
      updatedAnswers[subjectIndex][originalIndex] = currentAnswers.filter(
        i => i !== optionIndex
      );
    }

    setSelectedAnswers(updatedAnswers);
  };

  // Handle selecting an answer for single correct questions
  const handleSelectAnswer = (originalIndex, optionIndex) => {
    const updatedAnswers = [...selectedAnswers];
    const subjectIndex = test.subjects.findIndex(
      (subject) => subject.name === currentSubject
    );

    // Clear the previous selection if the same option is clicked again
    if (updatedAnswers[subjectIndex][originalIndex] === optionIndex) {
      updatedAnswers[subjectIndex][originalIndex] = null;
    } else {
      updatedAnswers[subjectIndex][originalIndex] = optionIndex;
    }

    setSelectedAnswers(updatedAnswers);
  };
  const handleIntegerAnswer = (originalIndex, value) => {
    const updatedAnswers = [...selectedAnswers];
    const subjectIndex = test.subjects.findIndex(
      subject => subject.name === currentSubject
    );

    // Validate input
    const parsedValue = parseFloat(value);
    if (!isNaN(parsedValue) || value === "") {
      updatedAnswers[subjectIndex][originalIndex] = value;
      setSelectedAnswers(updatedAnswers);
    }
  };

  // Handle changing the status of the question (e.g., Mark for Review, Submit Answer)
  const handleStatusChange = (originalIndex, status) => {
    const updatedStatus = [...questionStatus];
    const subjectIndex = test.subjects.findIndex(
      subject => subject.name === currentSubject
    );
    updatedStatus[subjectIndex][originalIndex] = status;
    setQuestionStatus(updatedStatus);
  };

  // Handle clearing the selected answer
  const handleClearAnswer = (originalIndex) => {
    const updatedAnswers = [...selectedAnswers];
    const subjectIndex = test.subjects.findIndex(
      subject => subject.name === currentSubject
    );
    updatedAnswers[subjectIndex][originalIndex] = null;
    setSelectedAnswers(updatedAnswers);

    const updatedStatus = [...questionStatus];
    updatedStatus[subjectIndex][originalIndex] = 0;
    setQuestionStatus(updatedStatus);
  };

  const switchSubject = () => {
    const currentIndex = test.subjects.findIndex(
      (subject) => subject.name === currentSubject
    );
    const nextIndex = (currentIndex + 1) % test.subjects.length;
    setCurrentSubject(test.subjects[nextIndex].name);
    setCurrentQuestionIndex(0); // Reset to first question
  };

  // Show the confirmation modal
  const handleSubmitTest = () => {
    setShowModal(true);
  };

  // Confirm submission and redirect to result screen


  const confirmSubmitTest = () => {
    setShowModal(false);
    if (test?._id) {
      localStorage.removeItem(`testAnswers_${test._id}`);
      localStorage.removeItem(`testStatus_${test._id}`);
      localStorage.removeItem(`testEndTime_${test._id}`);
    }

    let selectedAnswersCopy = JSON.parse(JSON.stringify(selectedAnswers));
    let questionStatusCopy = JSON.parse(JSON.stringify(questionStatus));

    // Calculate marks for each subject
    const subjectMarks = test.subjects.map((subject, subjectIndex) => {
      const correctAnswers = subject.questions.map((q) => q.correctAnswer);
      const studentAnswers = selectedAnswers[subjectIndex];
      let marks = 0;

      correctAnswers.forEach((correctAnswer, questionIndex) => {
        const studentAnswer = studentAnswers[questionIndex];
        const question = subject.questions[questionIndex];

        if (question.questionType === 'options') {
          // Single correct question
          if (studentAnswer + 1 === parseInt(correctAnswer)) {
            marks += test.mark_question; // Add marks for correct answer
          } else if (studentAnswer !== null) {
            marks -= question.negativeMark || 1; // Deduct negative marks for wrong answer
          }
        } else if (question.questionType === 'moptions') {
          // Multiple correct question
          const correctAnswerArray = correctAnswer
            .split('') // Split the string into individual characters
            .map((char) => parseInt(char) - 1) // Convert to zero-based indices
            .sort(); // Sort to ensure consistent comparison

          const studentAnswerArray = Array.isArray(studentAnswer)
            ? studentAnswer.sort() // Sort to ensure consistent comparison
            : [];

          // Check if the selected answers match the correct answers
          if (
            studentAnswerArray.length === correctAnswerArray.length &&
            studentAnswerArray.every((val, index) => val === correctAnswerArray[index])
          ) {
            marks += test.mark_question; // Add marks for correct answer
          } else if (studentAnswerArray.length > 0) {
            marks -= question.negativeMark || 1; // Deduct negative marks for wrong answer
          }
        } else if (question.questionType === 'integer') {
          // Integer type question
          const studentAns = parseFloat(studentAnswer);
          const correctAns = parseFloat(correctAnswer);
          let isCorrect = studentAns === correctAns;

          if (question.integerRange) {
            const min = parseFloat(question.integerRange.min);
            const max = parseFloat(question.integerRange.max);
            isCorrect = studentAns >= min && studentAns <= max;
          }

          if (isCorrect) {
            marks += test.mark_question; // Add marks for correct answer
          } else if (studentAnswer !== null) {
            marks -= question.negativeMark || 1; // Deduct negative marks for wrong answer
          }
        }
      });

      return {
        subjectName: subject.name,
        mark: marks,
        totalQuestions: correctAnswers.length,
      };
    });

    const totalMarks = subjectMarks.reduce((total, subject) => total + subject.mark, 0);
    const totalQuestions = subjectMarks.reduce((total, subject) => total + subject.totalQuestions, 0);

    // Redirect to ResultScreen and pass the calculated marks
    navigate(`/test/${test._id}/result`, {
      state: {
        subjectMarks,
        totalMarks,
        totalQuestions,
        userId: userData.id,
        testId: test._id,
        userName: userData.name,
        selectedAnswers: selectedAnswersCopy,
        questionStatus: questionStatusCopy,
        testQuestions: test.subjects,
        mark_question: test.mark_question,
      },
      replace: true,
    });
  };

  return (
    <div className="test-screen">
      {/* Top Bar */}
      <div className="top-bar">
        <div className="subject-info">
          <button onClick={switchSubject} className="subject-switch">
            {currentSubject}
          </button>
          <div className="timer">
            {timeLeft > 0 ? formatTime(timeLeft) : "Time's up!"}
          </div>
        </div>
        <div className="question-stats">
          <span>
            Attempted:{" "}
            {
              questionStatus[
                testData.subjects.findIndex(
                  (subject) => subject.name === currentSubject
                )
              ].filter((status) => status === 1).length
            }
          </span>
          <span>
            Marked:{" "}
            {
              questionStatus[
                testData.subjects.findIndex(
                  (subject) => subject.name === currentSubject
                )
              ].filter((status) => status === 2).length
            }
          </span>
          <span>
            Left:{" "}
            {
              questionStatus[
                testData.subjects.findIndex(
                  (subject) => subject.name === currentSubject
                )
              ].filter((status) => status === 0).length
            }
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="content">
        <div className="question-sections">
          {/* Single Correct Questions Section */}
          {/* Single Correct Questions Section */}
          {singleCorrect.length > 0 && (
            <div className="question-section">
              <h2>Single Correct Questions</h2>
              {singleCorrect.map((question, sectionIndex) => (
                <div key={sectionIndex} className="question-block">
                  <h3>Question {question.originalIndex + 1}</h3>
                  <p>{question.question}</p>
                  {question.image && (
                    <img
                      src={question.image}
                      alt="Question related"
                      className="question-image"
                    />
                  )}
                  <div className="options">
                    {question.options.map((option, optionIndex) => (
                      <label key={optionIndex} className="option">
                        <input
                          type="radio"
                          name={`answer-${question.originalIndex}`}
                          checked={
                            selectedAnswers[
                            testData.subjects.findIndex(
                              subject => subject.name === currentSubject
                            )
                            ][question.originalIndex] === optionIndex
                          }
                          onChange={() => handleSelectAnswer(question.originalIndex, optionIndex)}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                  <div className="question-actions">
                    <button onClick={() => handleStatusChange(question.originalIndex, 2)}>
                      Mark for Review
                    </button>
                    <button onClick={() => handleStatusChange(question.originalIndex, 1)}>
                      Submit Answer
                    </button>
                    <button onClick={() => handleClearAnswer(question.originalIndex)}>
                      Clear Answer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Multiple Correct Questions Section */}
          {multipleCorrect.length > 0 && (
            <div className="question-section">
              <h2>Multiple Correct Questions</h2>
              {multipleCorrect.map((question, sectionIndex) => (
                <div key={sectionIndex} className="question-block">
                  <h3>Question {question.originalIndex + 1}</h3>
                  <p>{question.question}</p>
                  {question.image && (
                    <img
                      src={question.image}
                      alt="Question related"
                      className="question-image"
                    />
                  )}
                  <div className="options">
                    {question.options.map((option, optionIndex) => (
                      <label key={optionIndex} className="option">
                        <input
                          type="checkbox"
                          checked={
                            (selectedAnswers[
                              testData.subjects.findIndex(
                                subject => subject.name === currentSubject
                              )
                            ][question.originalIndex] || []).includes(optionIndex)
                          }
                          onChange={(e) => handleMultiSelect(
                            question.originalIndex,
                            optionIndex,
                            e.target.checked
                          )}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                  <div className="question-actions">
                    <button onClick={() => handleStatusChange(question.originalIndex, 2)}>
                      Mark for Review
                    </button>
                    <button onClick={() => handleStatusChange(question.originalIndex, 1)}>
                      Submit Answer
                    </button>
                    <button onClick={() => handleClearAnswer(question.originalIndex)}>
                      Clear Answer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {integerQuestions.length > 0 && (
            <div className="question-section">
              <h2>Integer Answer Questions</h2>
              {integerQuestions.map((question, sectionIndex) => (
                <div key={sectionIndex} className="question-block">
                  <h3>Question {question.originalIndex + 1}</h3>
                  <p>{question.question}</p>
                  {question.image && (
                    <img
                      src={question.image}
                      alt="Question related"
                      className="question-image"
                    />
                  )}
                  <div className="integer-input">
                    <input
                      type="number"
                      value={
                        selectedAnswers[
                        testData.subjects.findIndex(
                          subject => subject.name === currentSubject
                        )
                        ][question.originalIndex] || ""
                      }
                      onChange={(e) => handleIntegerAnswer(
                        question.originalIndex,
                        e.target.value
                      )}
                      min={question.integerRange?.min}
                      max={question.integerRange?.max}
                      step="any"
                    />
                    {question.integerRange && (
                      <span className="range-hint">
                        (Range: {question.integerRange.min} - {question.integerRange.max})
                      </span>
                    )}
                  </div>
                  {/* Add status buttons for each question */}
                  <div className="question-actions">
                    <button onClick={() => handleStatusChange(question.originalIndex, 2)}>
                      Mark for Review
                    </button>
                    <button onClick={() => handleStatusChange(question.originalIndex, 1)}>
                      Submit Answer
                    </button>
                    <button onClick={() => handleClearAnswer(question.originalIndex)}>
                      Clear Answer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Question List */}
        <div className="question-list">
          {questions.map((q, index) => {
            const status =
              questionStatus[
              testData.subjects.findIndex(
                (subject) => subject.name === currentSubject
              )
              ][index];

            let statusClass = "unattempted";
            if (status === 1) statusClass = "attempted";
            if (status === 2) statusClass = "marked";

            return (
              <div
                key={index}
                className={`question-number ${statusClass}`}
                onClick={() => setCurrentQuestionIndex(index)}
              >
                {index + 1}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="bottom-nav">
        <button
          onClick={() =>
            setCurrentQuestionIndex((prev) =>
              prev < questions.length - 1 ? prev + 1 : prev
            )
          }
          className="next-button"
        >
          Next Question
        </button>
        <button className="submit-button" onClick={handleSubmitTest}>
          Submit Test
        </button>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Are you sure you want to submit the test?</h2>
            <button onClick={confirmSubmitTest} className="yes-button">
              Yes
            </button>
            <button onClick={() => setShowModal(false)} className="no-button">
              No
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestScreen;