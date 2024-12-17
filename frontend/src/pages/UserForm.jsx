import React, { useState } from "react";
import { TextField, Button, Box, Typography, Paper } from "@mui/material";

const UserForm = ({ setUser }) => {
  const [name, setName] = useState("");
  const [carNumber, setCarNumber] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name && carNumber) {
      setUser({ name, carNumber });
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        mt: 5,
      }}
    >
      <Paper sx={{ padding: 3, maxWidth: 400, width: "100%" }}>
        <Typography variant="h4" gutterBottom>
          Enter Your Details
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            margin="normal"
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Car Number"
            value={carNumber}
            onChange={(e) => setCarNumber(e.target.value)}
          />
          <Button
            fullWidth
            type="submit"
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
          >
            Submit
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default UserForm;
