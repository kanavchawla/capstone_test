import React, { useEffect, useState } from "react";
import { Grid, Typography, Box, Paper } from "@mui/material";
import Timer from "./Timer";
import axios from "axios";

const SlotSelector = ({ parkingUser }) => {
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isWithinRange, setIsWithinRange] = useState(true);

  const targetLocation = { lat: 30.353815, lon: 76.367822 }; // Target location coordinates
  const radius = 1; // 1km radius

  useEffect(() => {
    if (parkingUser) {
      fetchSlots();

      // Update slots every 5 seconds
      const intervalId = setInterval(fetchSlots, 5000); // 5 seconds

      return () => clearInterval(intervalId); // Clean up interval on unmount
    }
  }, [parkingUser]);

  const fetchSlots = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/slots");
      setSlots(response.data);
    } catch (error) {
      console.error("Error fetching slots:", error);
    }
  };

  const handleBookSlot = async (slotNumber) => {
    // Check if the user is within the 1km radius
    if (!isWithinRange) {
      alert("You must be within 1km of the parking location to book a slot.");
      return;
    }

    // Prevent booking if user already has a booked slot
    if (parkingUser?.slotInfo?.booked) {
      alert(
        "You already have an active booking. You cannot book more than one slot."
      );
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8000/api/slots/book",
        {
          slotNumber,
          parkingUserId: parkingUser._id,
        }
      );

      // Ensure duration is valid
      const bookedSlot = response.data;
      const duration = bookedSlot.duration ? bookedSlot.duration : 5; // Fallback to 5 minutes if duration is not available

      setSelectedSlot({
        ...bookedSlot,
        duration: duration, // Ensure duration is valid
      });

      fetchSlots(); // Re-fetch slots after booking
    } catch (error) {
      console.error("Error booking slot:", error);
    }
  };

  const handleExpire = async () => {
    try {
      await axios.post("http://localhost:8000/api/slots/clear-expired");
      setSelectedSlot(null);
      fetchSlots();
    } catch (error) {
      console.error("Error clearing expired slots:", error);
    }
  };

  // Check if the user is within the target location radius
  const checkUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const userLat = position.coords.latitude;
        const userLon = position.coords.longitude;

        // Calculate distance from the target location
        const distance = calculateDistance(
          userLat,
          userLon,
          targetLocation.lat,
          targetLocation.lon
        );

        if (distance <= radius) {
          setIsWithinRange(true);
        } else {
          setIsWithinRange(false);
        }
      });
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  // Function to calculate distance between two points in km
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const toRadians = (deg) => deg * (Math.PI / 180);
    const R = 6371; // Radius of the Earth in km
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
  };

  useEffect(() => {
    if (parkingUser) {
      checkUserLocation();
    }
  }, [parkingUser]);

  // Check if parkingUser is available before rendering the component
  if (!parkingUser) {
    return <Typography variant="h6">Loading...</Typography>;
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Welcome, {parkingUser.name}! Select a Slot Below:
      </Typography>
      <Grid container spacing={2}>
        {slots.map((slot) => (
          <Grid item xs={4} key={slot.number}>
            <Paper
              onClick={() => handleBookSlot(slot.number)}
              sx={{
                padding: 2,
                backgroundColor:
                  slot.status === "empty"
                    ? "green"
                    : slot.status === "booked"
                    ? "yellow"
                    : slot.status === "arduino_confirmed"
                    ? "red"
                    : "grey", // Default color for any other status (optional)
                color: "white",
                textAlign: "center",
                cursor: "pointer",
                borderRadius: 2,
                boxShadow: 2,
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                "&:hover": {
                  transform: "scale(1.05)",
                  boxShadow: 6,
                },
              }}
            >
              <Typography variant="h6">Slot {slot.number}</Typography>
              {slot.status !== "empty" && (
                <Typography variant="body2">Status: {slot.status}</Typography>
              )}
            </Paper>
          </Grid>
        ))}
      </Grid>
      {selectedSlot && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6">
            Slot {selectedSlot.number} Booked
          </Typography>
          <Timer duration={selectedSlot.duration} onExpire={handleExpire} />
        </Box>
      )}
    </Box>
  );
};

export default SlotSelector;
