import React from "react";

const UpcomingTests = ({ tests }) => {
  return (
    <div className="upcoming-tests">
      <h3>Upcoming Tests</h3>
      <ul>
        {tests.map((test, index) => (
          <li key={index}>
            <strong>{test.name}</strong> - {test.date}
            <br />
            Syllabus: {test.syllabus}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UpcomingTests;
