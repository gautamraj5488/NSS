import React from "react";

const SubjectSwitcher = ({ subjects, onSwitch }) => {
  return (
    <div className="subject-switcher">
      {subjects.map((subject, index) => (
        <button
          key={index}
          className="subject-button"
          onClick={() => onSwitch(subject)}
        >
          {subject}
        </button>
      ))}
    </div>
  );
};

export default SubjectSwitcher;
