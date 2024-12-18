import React, { useState } from "react";
import {
  TextField,
  Button,
  Box,
  Paper,
  Typography,
  Grid,
  Fade,
} from "@mui/material";
import { useSpring, animated } from "react-spring";
import axios from "axios";
// Import the image
import backgroundImage from "./i1.png";

const UserForm = ({ onRegister }) => {
  const [formData, setFormData] = useState({ name: "", carNumber: "" });
  const [submitted, setSubmitted] = useState(false);

  // Animation for fading background
  const fadeProps = useSpring({
    opacity: 1,
    from: { opacity: 0 },
    config: { duration: 2000 }, // Adjust duration for the fade effect
  });

  const springProps = useSpring({
    opacity: 1,
    transform: "translateY(0)",
    from: { opacity: 0, transform: "translateY(-20px)" },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:8000/api/parking-user",
        formData
      );
      onRegister(response.data);
      setSubmitted(true);
    } catch (error) {
      console.error("Error registering user:", error);
    }
  };

  return (
    <animated.div
      style={{
        ...fadeProps,
        backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.8)), url(${backgroundImage})`, // Overlay gradient for fade effect
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh",
      }}
    >
      <Grid
        container
        justifyContent="center"
        alignItems="center"
        style={{
          minHeight: "100vh",
        }}
      >
        <Grid item xs={11} sm={8} md={6} lg={4}>
          <Fade in={!submitted} timeout={1000}>
            <animated.div style={springProps}>
              <Paper elevation={6} sx={{ p: 4, borderRadius: 3 }}>
                <Typography variant="h4" align="center" gutterBottom>
                  Parking User Registration
                </Typography>
                <Typography
                  variant="subtitle1"
                  align="center"
                  color="textSecondary"
                  gutterBottom
                >
                  Enter your details below to register your vehicle.
                </Typography>
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                  <TextField
                    label="Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    required
                    variant="outlined"
                  />
                  <TextField
                    label="Car Number"
                    name="carNumber"
                    value={formData.carNumber}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    required
                    variant="outlined"
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{
                      mt: 3,
                      py: 1.5,
                      fontWeight: "bold",
                      backgroundColor: "#1976d2",
                      "&:hover": { backgroundColor: "#1565c0" },
                    }}
                  >
                    Register
                  </Button>
                </Box>
              </Paper>
            </animated.div>
          </Fade>
        </Grid>
      </Grid>
    </animated.div>
  );
};

export default UserForm;
