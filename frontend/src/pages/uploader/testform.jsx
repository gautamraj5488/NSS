import React, { useState,useEffect } from "react";
import Axios from "axios";
import './testform.css';
import { Navigate, useNavigate } from "react-router-dom";

const TestForm = () => {
  const [testTitle, setTestTitle] = useState("");
  const [numSubjects, setNumSubjects] = useState(1);
  const [subjects, setSubjects] = useState([{ name: "", questions: [] }]);
  const [duration, setDuration] = useState("");
  const [markingScheme, setMarkingScheme] = useState("");
  const [step, setStep] = useState(1); // Control the step (Step 1 or Step 2)
  const [currentSubjectIndex, setCurrentSubjectIndex] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [timeInputValue, setTimeInputValue] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [examDate, setExamDate] = useState("");
  const [questionType, setQuestionType] = useState("options");
  const [integerRange, setIntegerRange] = useState({ min: "", max: "" });
  const navigate = useNavigate(); // To navigate to result screen

  // Save state to localStorage whenever it changes
  useEffect(() => {
    const formState = {
      testTitle,
      numSubjects,
      subjects,
      duration,
      markingScheme,
      step,
      currentSubjectIndex,
      startTime,
      timeInputValue,
      examDate,
      questionType,
      integerRange,
    };
    localStorage.setItem("testFormState", JSON.stringify(formState));
  }, [
    testTitle,
    numSubjects,
    subjects,
    duration,
    markingScheme,
    step,
    currentSubjectIndex,
    startTime,
    timeInputValue,
    examDate,
    questionType,
    integerRange,
  ]);

  // // Retrieve state from localStorage on component mount
  // useEffect(() => {
  //   const savedState = localStorage.getItem("testFormState");
  //   if (savedState) {
  //     const {
  //       testTitle,
  //       numSubjects,
  //       subjects,
  //       duration,
  //       markingScheme,
  //       step,
  //       currentSubjectIndex,
  //       startTime,
  //       timeInputValue,
  //       examDate,
  //       questionType,
  //       integerRange,
  //     } = JSON.parse(savedState);

  //     setTestTitle(testTitle || "");
  //     setNumSubjects(numSubjects || 1);
  //     setSubjects(subjects || [{ name: "", questions: [] }]);
  //     setDuration(duration || "");
  //     setMarkingScheme(markingScheme || "");
  //     setStep(step || 1);
  //     setCurrentSubjectIndex(currentSubjectIndex || 0);
  //     setStartTime(startTime || 0);
  //     setTimeInputValue(timeInputValue || "");
  //     setExamDate(examDate || "");
  //     setQuestionType(questionType || "options");
  //     setIntegerRange(integerRange || { min: "", max: "" });
  //   }
  // }, []);

  const handleImageUpload = async (e, subjectIndex) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      setUploadingImage(true);
      const response = await Axios.post('http://localhost:8000/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setSubjects(prevSubjects => 
        prevSubjects.map((subject, i) => 
          i === subjectIndex ? { ...subject, currentImage: response.data.imageUrl } : subject
        )
      );
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleTimeChange = (e) => {
    const timeString = e.target.value;
    setTimeInputValue(timeString);
    
    // Convert HH:MM to decimal hours
    const [hours, minutes] = timeString.split(':').map(Number);
    const decimalTime = hours + (minutes / 60);
    setStartTime(decimalTime);
  };

  const handleNextStep = () => {
    if (step === 1) {
      setStep(2);
    }
  };

  const handleTestTitleChange = (e) => {
    setTestTitle(e.target.value);
  };

  const handleNumSubjectsChange = (e) => {
    const value = e.target.value;
    // Ensure the value is a valid number and greater than or equal to 1
    if (!isNaN(value) && value >= 1) {
      setNumSubjects(Number(value));
      const newSubjects = Array.from({ length: Number(value) }, (_, index) => ({
        name: `Subject ${index + 1}`,
        questions: [],
      }));
      setSubjects(newSubjects);
    } else {
      // If the input is invalid, reset to the default value (1)
      setNumSubjects(1);
    }
  };

  const handleSubjectNameChange = (index, e) => {
    setSubjects(prevSubjects => 
      prevSubjects.map((subject, i) => 
        i === index ? { ...subject, name: e.target.value } : subject
      )
    );
  };

  const handleAddQuestion = () => {
    setSubjects(prevSubjects => {
      const currentSubject = prevSubjects[currentSubjectIndex];
      const newQuestion = {
        questionType,
        question: currentSubject.currentQuestion || "",
        options: (questionType === "options" || questionType === "moptions") 
          ? currentSubject.currentOptions 
          : [],
        correctAnswer: currentSubject.correctAnswer || "",
        image: currentSubject.currentImage || null,
        negativeMark: currentSubject.currentNegativeMark || 1,
        ...(questionType === "integer" && { integerRange })
      };

      // Clear current fields by creating new subject with default values
      const updatedSubjects = prevSubjects.map((subject, i) => 
        i === currentSubjectIndex ? {
          ...subject,
          questions: [...subject.questions, newQuestion],
          currentQuestion: "",
          currentOptions: ["", "", "", ""],
          correctAnswer: "",
          currentImage: null,
          currentNegativeMark: 1,
        } : subject
      );

      return updatedSubjects;
    });

    setQuestionType("options");
    setIntegerRange({ min: "", max: "" });
  };
  const handleQuestionChange = (e) => {
    const value = e.target.value;
    setSubjects(prevSubjects => 
      prevSubjects.map((subject, i) => 
        i === currentSubjectIndex ? { ...subject, currentQuestion: value } : subject
      )
    );
  };
  const handleOptionChange = (optionIndex, e) => {
    const value = e.target.value;
    setSubjects(prevSubjects => 
      prevSubjects.map((subject, i) => {
        if (i === currentSubjectIndex) {
          const newOptions = [...(subject.currentOptions || ["", "", "", ""])];
          newOptions[optionIndex] = value;
          return { ...subject, currentOptions: newOptions };
        }
        return subject;
      })
    );
  };
  const handleCorrectAnswerChange = (e) => {
    const value = e.target.value;
    setSubjects(prevSubjects => 
      prevSubjects.map((subject, i) => 
        i === currentSubjectIndex ? { ...subject, correctAnswer: value } : subject
      )
    );
  };

  const handleNegativeMarkChange = (e) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setSubjects(prevSubjects => 
        prevSubjects.map((subject, i) => 
          i === currentSubjectIndex ? { ...subject, currentNegativeMark: value } : subject
        )
      );
    }
  };

  const handleRemoveImage = (subjectIndex) => {
    setSubjects(prevSubjects => 
      prevSubjects.map((subject, i) => 
        i === subjectIndex ? { ...subject, currentImage: null } : subject
      )
    );
  };
  const handleSubjectSelect = (e) => {
    setCurrentSubjectIndex(e.target.value);
  };

  const handleUploadData = async () => {
    try {
      const cleanedSubjects = subjects.map(subject => ({
        name: subject.name,
        questions: subject.questions.map(question => ({
          questionType: question.questionType,
          question: question.question,
          options: question.options,
          correctAnswer: question.correctAnswer,
          image: question.image || null,
          negativeMark: question.negativeMark,
          ...(question.questionType === "integer" && { 
            integerRange: question.integerRange 
          })
        }))
      }));
  
      const payload = {
        testTitle,
        subjects: cleanedSubjects, // Use the cleaned data
        duration,
        markingScheme,
        startTime,
        examDate,
      };
  
      console.log("Cleaned Payload:", payload); // Verify the cleaned data
  
      const response = await Axios.post("http://localhost:8000/upload-test", payload);
      // In handleUploadData after successful upload
    subjects.forEach(subject => {
      subject.questions.forEach(question => {
        // Delete only if image exists and wasn't used in any question
        if (question.image && !subject.questions.some(q => q.image === question.image)) {
          const filename = question.image.split('/uploads/')[1];
          Axios.delete(`http://localhost:8000/delete-image/${filename}`);
        }
      });
    });
      alert("Test uploaded successfully!");
      localStorage.removeItem("testFormState");
      navigate("/admin",{
        replace:true
      });
    } catch (err) {
      console.error("Error uploading test data:", err);
    }
  };

  return (
    <div className="test-form">
     {step === 1 && (
  <>
    <h2>Create New Test</h2>
    <div className="step1-grid">
      <div className="form-section">
        <div className="form-group">
          <label>Test Title</label>
          <input
            type="text"
            value={testTitle}
            onChange={handleTestTitleChange}
            placeholder="Enter test title"
          />
        </div>
        
        <div className="form-group">
          <label>Duration</label>
          <input
            type="text"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="Enter test duration (e.g., 2 hours)"
          />
        </div>
      </div>

      <div className="form-section">
        <div className="form-group">
          <label>Marking Scheme</label>
          <input
            type="text"
            value={markingScheme}
            onChange={(e) => setMarkingScheme(e.target.value)}
            placeholder="Mark per question"
          />
        </div>
        
        <div className="form-group">
          <label>Test Start Time</label>
          <input
            type="time"
            value={timeInputValue}
            onChange={handleTimeChange}
            required
          />
        </div>
      </div>

      <div className="form-section">
        <div className="form-group">
          <label>Test Date</label>
          <input
            type="date"
            value={examDate}
            onChange={(e) => setExamDate(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Number of Subjects</label>
          <input
            type="number"
            value={numSubjects}
            onChange={handleNumSubjectsChange}
            placeholder="Enter number of subjects"
          />
        </div>
      </div>
    </div>

    <div className="subject-list">
      {subjects.map((subject, index) => (
        <div key={index} className="form-group">
          <label>Subject {index + 1} Name</label>
          <input
            type="text"
            value={subject.name}
            onChange={(e) => handleSubjectNameChange(index, e)}
            placeholder={`Subject ${index + 1} Name`}
          />
        </div>
      ))}
    </div>

    <div className="step-navigation">
      <button onClick={handleNextStep}>Next</button>
    </div>
  </>
)}
     {step === 2 && (
  <>
    <h2>Add Questions</h2>
    <div className="step2-grid">
      {/* Left Column - Main Question Content */}
      <div className="question-main">
        <div className="form-section-grid">
          <div className="form-group">
            <label>Select Subject</label>
            <select value={currentSubjectIndex} onChange={handleSubjectSelect}>
              {subjects.map((subject, index) => (
                <option key={index} value={index}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Question</label>
            <input
            type="text"
            value={subjects[currentSubjectIndex]?.currentQuestion || ""}
            onChange={handleQuestionChange}
            placeholder="Enter question"
          />
          </div>
        </div>

        <div className="form-section-grid">
        <div className="form-group">
            <label>Question Image (Optional)</label>
            <div className="image-upload">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, currentSubjectIndex)}
                disabled={uploadingImage}
                id="image-upload"
                style={{ display: 'none' }}
              />
              <label htmlFor="image-upload" className="upload-button">
                {uploadingImage ? 'Uploading...' : 'Choose Image'}
              </label>
              {subjects[currentSubjectIndex].currentImage && (
                <div className="image-preview">
                  <img 
                    src={subjects[currentSubjectIndex].currentImage} 
                    alt="Question preview" 
                    style={{ maxWidth: '200px', marginTop: '10px' }}
                  />
                  <button 
                    type="button" 
                    onClick={() => handleRemoveImage(currentSubjectIndex)}
                    className="remove-image"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>Negative Marks</label>
            <input
              type="number"
              value={subjects[currentSubjectIndex]?.currentNegativeMark || 0}
              onChange={handleNegativeMarkChange}
              min="0"
              step="0.5"
             
            />
          </div>
        </div>
      </div>

      {/* Right Column - Question Settings */}
      <div className="side-settings">
        <div className="form-group">
          <label>Question Type</label>
          <select 
            value={questionType} 
            onChange={(e) => setQuestionType(e.target.value)}
          >
            <option value="options">Multiple Choice (Single Correct)</option>
            <option value="moptions">Multiple Choice (Multiple Correct)</option>
            <option value="integer">Integer Answer</option>
          </select>
        </div>

        {questionType === "options" || questionType === "moptions" ? (
          <div className="options-grid">
            {[0, 1, 2, 3].map((optionIndex) => (
              <div className="form-group" key={optionIndex}>
                <label>Option {optionIndex + 1}</label>
                <input
                  type="text"
                  value={subjects[currentSubjectIndex]?.currentOptions?.[optionIndex] || ""}
                  onChange={(e) => handleOptionChange(optionIndex, e)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="integer-range-grid">
            {/* <div className="form-group">
              <label>Minimum Value</label>
              <input
                type="number"
                value={integerRange.min}
                onChange={(e) => setIntegerRange(prev => ({...prev, min: e.target.value}))}
              />
            </div>
            <div className="form-group">
              <label>Maximum Value</label>
              <input
                type="number"
                value={integerRange.max}
                onChange={(e) => setIntegerRange(prev => ({...prev, max: e.target.value}))}
              />
            </div> */}
          </div>
        )}

        <div className="form-group">
          <label>Correct Answer</label>
          {questionType === "options" ? (
            <input
            type={questionType === "integer" ? "number" : "text"}
            value={subjects[currentSubjectIndex]?.correctAnswer || ""}
            onChange={handleCorrectAnswerChange}
              placeholder="Enter correct option (e.g., 1)"
            />
          ) :questionType === "moptions" ? (
            <input
              type="text"
              value={subjects[currentSubjectIndex].correctAnswer || ""}
              onChange={(e) =>
                setSubjects((prevSubjects) => {
                  const updated = [...prevSubjects];
                  updated[currentSubjectIndex].correctAnswer = e.target.value;
                  return updated;
                })
              }
              placeholder="Selected options (e.g., 124)"
            />
          ) : (
            <input
              type="number"
              value={subjects[currentSubjectIndex].correctAnswer || ""}
              onChange={(e) =>
                setSubjects((prevSubjects) => {
                  const updated = [...prevSubjects];
                  updated[currentSubjectIndex].correctAnswer = e.target.value;
                  return updated;
                })
              }
              placeholder="Enter correct value (e.g., 125.75)"
             
            />
          )}
        </div>
      </div>
    </div>

    {/* Question Preview Section */}
    <div className="question-preview-section">
      <h3>Questions for {subjects[currentSubjectIndex].name}</h3>
      <div className="preview-grid">
        {subjects[currentSubjectIndex].questions.map((question, index) => (
          <div key={index} className="question-card">
            {/* Existing question preview code */}
          </div>
        ))}
      </div>
    </div>

    <div className="step-navigation">
      <button type="button" onClick={handleAddQuestion}>
        Save Question
      </button>
      <button type="button" onClick={handleUploadData}>
        Upload Test
      </button>
    </div>
  </>
)}
    </div>
  );
};

export default TestForm;