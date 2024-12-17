import React, { useState, useEffect } from "react";

const Billing = ({ user, setUser }) => {
  const [bill, setBill] = useState(0);

  useEffect(() => {
    const endTime = new Date();
    const startTime = new Date(user.startTime);
    const duration = Math.ceil((endTime - startTime) / (1000 * 60)); // in minutes

    setBill(duration * 10); // Assume $10 per minute

    const updatedUser = {
      ...user,
      endTime: endTime.toLocaleString(),
      duration: `${duration} minutes`,
    };

    setUser(updatedUser);

    // Update the data.json file here (in a real-world app, you'd update the server)
    console.log("JSON file updated with unoccupied slot");
  }, []);

  return (
    <div>
      <h1>Billing Details</h1>
      <p>Name: {user.name}</p>
      <p>Car Number: {user.carNumber}</p>
      <p>Slot ID: {user.slotId}</p>
      <p>Duration: {user.duration}</p>
      <p>Total Bill: ${bill}</p>
    </div>
  );
};

export default Billing;
