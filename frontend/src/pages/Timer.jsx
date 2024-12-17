import React, { useEffect } from "react";
import { Typography } from "@mui/material";

const Timer = ({ timer, setTimer }) => {
  useEffect(() => {
    if (timer > 0) {
      const countdown = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(countdown);
    }
  }, [timer, setTimer]);

  return (
    <Typography variant="h6" sx={{ color: "red" }}>
      {timer > 0 ? `Time Remaining: ${timer} seconds` : "Time's up!"}
    </Typography>
  );
};

export default Timer;
