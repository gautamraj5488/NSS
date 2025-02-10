import React from "react";

const Bookmarks = ({ bookmarks }) => {
  return (
    <div className="bookmarks">
      <h3>Bookmarked Questions</h3>
      <ul>
        {bookmarks.map((bookmark, index) => (
          <li key={index}>
            <strong>Q:</strong> {bookmark.question}
            <br />
            <strong>Answer:</strong> {bookmark.answerKey}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Bookmarks;
