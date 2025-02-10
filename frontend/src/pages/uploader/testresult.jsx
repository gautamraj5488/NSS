import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './testresult.css';

const TestResultsAdmin = () => {
  const location = useLocation();
  const { test } = location.state || {};

  if (!test) {
    return (
      <div className="error">
        <p>No test data found</p>
        <Link to="/admin">Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="test-results-container">
      <div className="header">
        <h1>Test Results: {test.testTitle}</h1>
        <Link to="/admin" className="back-button">
          ← Back to Dashboard
        </Link>
      </div>
      <div className="students-list">
        {test.students.map((student) => {
          const chartData = student.marks.map(subject => ({
            subject: subject.subjectName,
            marks: subject.mark
          }));
          return (
            <div key={student.userId} className="student-card">
              <div className="student-header">
                <h3>{student.userName}</h3>
                <span className="total-marks">Total: {student.totalMarks}</span>
              </div>
              <div className="marks-details">
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="subject" 
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                      />
                      <YAxis />
                      <Tooltip />
                      <Bar 
                        dataKey="marks" 
                        fill="#8884d8" 
                        name="Marks"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {student.marks.map((subject, index) => (
                  <div key={index} className="subject-mark">
                    <span className="subject-name">{subject.subjectName}</span>
                    <span className="mark-score">
                      {subject.mark}/{subject.totalQuestions * 4}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TestResultsAdmin;