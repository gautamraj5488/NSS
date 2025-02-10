import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Axios from 'axios';
 import './editquestion.css'; // Create this CSS file

const EditQuestion = () => {
  const { testId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { test, subjectIndex, questionIndex } = location.state;

  const [questionData, setQuestionData] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    image: null,
    integerRange: { min: '', max: '' },
  });

  // Load the question data when the component mounts
  useEffect(() => {
    const question = test.subjects[subjectIndex].questions[questionIndex];
    setQuestionData({
      question: question.question,
      options: question.options || ['', '', '', ''],
      correctAnswer: question.correctAnswer,
      image: question.image,
      integerRange: question.integerRange || { min: '', max: '' },
    });
  }, [test, subjectIndex, questionIndex]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setQuestionData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle option changes
  const handleOptionChange = (index, value) => {
    const newOptions = [...questionData.options];
    newOptions[index] = value;
    setQuestionData((prev) => ({ ...prev, options: newOptions }));
  };

  // Handle integer range changes
  const handleRangeChange = (e) => {
    const { name, value } = e.target;
    setQuestionData((prev) => ({
      ...prev,
      integerRange: { ...prev.integerRange, [name]: value },
    }));
  };


  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Update the question in the test data
      const updatedTest = { ...test };
      updatedTest.subjects[subjectIndex].questions[questionIndex] = questionData;

      const response = await fetch(
        `http://localhost:8000/update-test/${testId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedTest),
        }
      );
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
      navigate(`/admin/upcoming/${testId}`, { state: { test: data.test } });
    } catch (error) {
      console.error('Error updating question:', error);
    }
  };

  return (
    <div className="edit-question-container">
      <h1>Edit Question</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Question:</label>
          <input
            type="text"
            name="question"
            value={questionData.question}
            onChange={handleInputChange}
            required
          />
        </div>

        {questionData.options.length > 0 && (
          <div className="form-group">
            <label>Options:</label>
            {questionData.options.map((option, index) => (
              <input
                key={index}
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                placeholder={`Option ${index + 1}`}
              />
            ))}
          </div>
        )}

        <div className="form-group">
          <label>Correct Answer:</label>
          <input
            type="text"
            name="correctAnswer"
            value={questionData.correctAnswer}
            onChange={handleInputChange}
            required
          />
        </div>

        {!questionData.options.length && (
          <div className="form-group">
            <label>Integer Range:</label>
            <input
              type="number"
              name="min"
              value={questionData.integerRange.min}
              onChange={handleRangeChange}
              placeholder="Min"
            />
            <input
              type="number"
              name="max"
              value={questionData.integerRange.max}
              onChange={handleRangeChange}
              placeholder="Max"
            />
          </div>
        )}

        <button type="submit" className="save-button">
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default EditQuestion;