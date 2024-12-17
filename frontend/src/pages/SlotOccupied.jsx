import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const SlotOccupied = ({ user, setUser }) => {
  const [slot, setSlot] = useState(null);
  const [duration, setDuration] = useState("0 minutes");
  const [slotStatus, setSlotStatus] = useState("Occupied");
  const navigate = useNavigate();

  // Helper function to fetch data and check the slot status
  const fetchSlotData = async () => {
    try {
      const response = await fetch("/data.json");
      const data = await response.json();
      const occupiedSlot = data.find((slot) => slot.id === user.slotId);

      if (occupiedSlot) {
        setSlot(occupiedSlot);
        setSlotStatus(occupiedSlot.occupied ? "Occupied" : "Unoccupied");

        // Calculate the duration if the slot is still occupied
        if (occupiedSlot.occupied) {
          const endTime = new Date();
          const startTime = new Date(user.startTime);
          const minutes = Math.ceil((endTime - startTime) / (1000 * 60));
          setDuration(`${minutes} minutes`);
        } else {
          navigate("/billing");
        }
      }
    } catch (error) {
      console.error("Error fetching slot data:", error);
    }
  };

  useEffect(() => {
    // Initial check on page load
    fetchSlotData();

    // Set interval to check for updates every 5 seconds
    const interval = setInterval(fetchSlotData, 5000);

    return () => clearInterval(interval); // Clean up the interval on component unmount
  }, [user]);

  return (
    <div>
      <h1>Slot Occupied</h1>
      <p>Slot ID: {user.slotId}</p>
      <p>Status: {slotStatus}</p>
      <p>Start Time: {user.startTime}</p>
      <p>Duration: {duration}</p>

      {slotStatus === "Unoccupied" && (
        <p>The slot has been released. Redirecting to billing...</p>
      )}
    </div>
  );
};

export default SlotOccupied;
