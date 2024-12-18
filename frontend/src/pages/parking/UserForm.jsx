import React, { useState } from "react";
import { TextField, Button, Box } from "@mui/material";
import axios from "axios";

const UserForm = ({ onRegister }) => {
  const [formData, setFormData] = useState({ name: "", carNumber: "" });

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
      onRegister(response.data); // This will be called when registration is successful
    } catch (error) {
      console.error("Error registering user:", error);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
      <TextField
        label="Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        fullWidth
        margin="normal"
        required
      />
      <TextField
        label="Car Number"
        name="carNumber"
        value={formData.carNumber}
        onChange={handleChange}
        fullWidth
        margin="normal"
        required
      />
      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        sx={{ mt: 2 }}
      >
        Register
      </Button>
    </Box>
  );
};

export default UserForm;
