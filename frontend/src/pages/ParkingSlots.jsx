import React, { useEffect, useState } from "react";
import { Grid, Box, Typography, Paper } from "@mui/material";
import Timer from "./Timer";

const ParkingSlots = ({ user }) => {
  const [slots, setSlots] = useState([]);
  const [timer, setTimer] = useState(null);
  const [slotBooked, setSlotBooked] = useState(null);

  // Fetch the slot data initially
  useEffect(() => {
    fetchSlots(); // Fetch initially when component mounts
    const intervalId = setInterval(fetchSlots, 5000); // Poll every 5 seconds

    return () => {
      clearInterval(intervalId); // Cleanup the interval when component unmounts
    };
  }, []);

  const fetchSlots = () => {
    fetch("http://localhost:5000/slots")
      .then((res) => res.json())
      .then((data) => setSlots(data))
      .catch((err) => console.error("Error fetching slots:", err));
  };

  useEffect(() => {
    // Clear the slot after 5 minutes if it's booked but not occupied
    if (timer === 0 && slotBooked) {
      fetch("http://localhost:5000/update-slot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: slotBooked, status: "empty" }),
      })
        .then((res) => res.json())
        .then((data) => {
          setSlots(data.slots); // Update UI with new slot data
          setSlotBooked(null); // Reset booked slot state
        })
        .catch((err) => console.error("Error updating slot:", err));
    }
  }, [timer, slotBooked]);

  const handleBookSlot = (slotId) => {
    if (slotBooked) return; // Prevent booking if a slot is already booked

    fetch("http://localhost:5000/update-slot", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: slotId, status: "booked" }),
    })
      .then((res) => res.json())
      .then((data) => {
        setSlots(data.slots); // Update UI with new slot data
        setSlotBooked(slotId); // Mark the slot as booked
        setTimer(300); // 5 minutes countdown
      })
      .catch((err) => console.error("Error updating slot:", err));
  };

  const renderSlots = () => {
    return slots.map((slot) => {
      const slotColor =
        slot.status === "empty"
          ? "green"
          : slot.status === "booked"
          ? "yellow"
          : "red";
      const isDisabled = slot.status !== "empty" || slotBooked;

      return (
        <Grid item key={slot.id} xs={4} sm={3} md={2}>
          <Box
            sx={{
              width: 100,
              height: 100,
              backgroundColor: slotColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: isDisabled ? "not-allowed" : "pointer",
              borderRadius: 1,
              boxShadow: 2,
              "&:hover": {
                opacity: 0.8,
              },
            }}
            onClick={() => !isDisabled && handleBookSlot(slot.id)}
          >
            <Typography variant="h6" sx={{ color: "white" }}>
              {slot.id}
            </Typography>
          </Box>
        </Grid>
      );
    });
  };

  return (
    <Box sx={{ padding: 5 }}>
      <Paper sx={{ padding: 3 }}>
        <Typography variant="h4" gutterBottom>
          Welcome, {user.name}! Select a Parking Slot
        </Typography>
        <Grid container spacing={2}>
          {renderSlots()}
        </Grid>
        {timer && (
          <Box mt={3}>
            <Timer timer={timer} setTimer={setTimer} />
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default ParkingSlots;
