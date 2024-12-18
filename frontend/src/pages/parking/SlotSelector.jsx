import React, { useEffect, useState } from "react";
import { Grid, Typography, Box, Button } from "@mui/material"; // Ensure Button is imported
import Timer from "./Timer";
import axios from "axios";

const SlotSelector = ({ parkingUser }) => {
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isWithinRange, setIsWithinRange] = useState(true);

  const targetLocation = { lat: 30.353815, lon: 76.367822 }; // Target location coordinates
  const radius = 1; // 1km radius

  // Polling interval in milliseconds
  const POLLING_INTERVAL = 5000;

  useEffect(() => {
    if (parkingUser) {
      // Initial fetch
      fetchSlots();

      // Set up polling
      const pollingInterval = setInterval(fetchSlots, POLLING_INTERVAL);

      return () => clearInterval(pollingInterval); // Clean up on unmount
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

  const checkUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const userLat = position.coords.latitude;
        const userLon = position.coords.longitude;

        const distance = calculateDistance(
          userLat,
          userLon,
          targetLocation.lat,
          targetLocation.lon
        );

        setIsWithinRange(distance <= radius);
      });
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

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
    return R * c; // Distance in km
  };

  useEffect(() => {
    if (parkingUser) {
      checkUserLocation();
    }
  }, [parkingUser]);

  const getSlotContent = (status, slotNumber) => {
    switch (status) {
      case "booked":
        return (
          <iframe
            src="https://lottie.host/embed/75ca03f5-00f5-4da2-8cc7-f4b9b587d577/rNZ1AB2Og3.lottie"
            style={{
              height: "100%", // Fit the iframe within the button
              width: "100%",  // Fit the iframe within the button
              border: "none",
            }}
            title={`Slot ${slotNumber} Booked`}
          />
        );
      case "empty":
        return `Slot ${slotNumber}`;
      case "aurdino_booked":
        return (
          <iframe
            src="https://lottie.host/embed/57f8652c-baf1-4e68-b81f-9d0398546b1f/dadlGEGXWr.lottie"
            style={{
              height: "100%", // Fit the iframe within the button
              width: "100%",  // Fit the iframe within the button
              border: "none",
            }}
            title={`Slot ${slotNumber} Aurduino Booked`}
          />
        );
      default:
        return "Unknown";
    }
  };

  if (!parkingUser) {
    return <Typography variant="h6">Loading...</Typography>;
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Welcome, {parkingUser.name}! Select a Slot Below:
      </Typography>
      <Grid container spacing={2} direction="column"> {/* Changed to column direction */}
        {slots.map((slot) => (
          <Grid item key={slot.number}> {/* Removed xs={4} to fit slots vertically */}
            <Button
              variant="contained"
              fullWidth
              disabled={slot.status !== "empty" || parkingUser?.slotInfo?.booked}
              onClick={() => handleBookSlot(slot.number)}
              sx={{
                backgroundColor: slot.status === "empty" ? "green" : "gray",
                color: "white",
                height: 200, // Increased height
                width: "50%", // Reduced width
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 2, // Optional: For rounded corners
                padding: 0, // Remove padding for better iframe fit
                marginBottom: 2, // Added spacing between buttons
                marginLeft: "auto", // Center button horizontally
                marginRight: "auto", // Center button horizontally
              }}
            >
              {getSlotContent(slot.status, slot.number)}
            </Button>
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
