import React, { useState, useEffect } from "react";

const Timer = ({ duration }) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return <div className="timer">Time Left: {formatTime(timeLeft)}</div>;
};

export default Timer;
