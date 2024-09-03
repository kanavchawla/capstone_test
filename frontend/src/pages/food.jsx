import React, { useState } from "react";
import { Button, Typography, Grid, Box } from "@mui/material";
import axios from "axios";
import { useSelector } from "react-redux";
import { selectUserInfo } from '../features/user/UserSlice';

const OrderForm = ({ onOrderSubmit }) => {
  const [order, setOrder] = useState([]);

  // Access the user info from Redux store
  const userInfo = useSelector(selectUserInfo);

  const handleAddItem = (item, quantity) => {
    setOrder([...order, { item, quantity }]);
  };

  const handleSubmit = async () => {
    try {
      const userId = userInfo._id; // Assuming you're getting this from Redux or context
      const response = await axios.post("http://localhost:8000/food-orders", {
        userId,
        items: order,
      });
  
      if (response.status === 201) {
        console.log("Order placed successfully", response.data);
        onOrderSubmit(response.data.foodOrder); // Pass the entire order object to the QR code component
      }
    } catch (error) {
      console.error("Error placing order:", error);
    }
  };
  
  

  return (
    <Box
      sx={{
        p: 3,
        maxWidth: 400,
        margin: "auto",
        textAlign: "center",
        backgroundColor: "#f9f9f9",
        borderRadius: 2,
      }}
    >
      <Typography variant="h4" component="h2" gutterBottom>
        Place Your Order
      </Typography>
      <Grid container spacing={2} justifyContent="center" sx={{ mb: 3 }}>
        <Grid item>
          <Button variant="contained" color="primary" onClick={() => handleAddItem("Pizza", 1)}>
            Add Pizza
          </Button>
        </Grid>
        <Grid item>
          <Button variant="contained" color="secondary" onClick={() => handleAddItem("Burger", 1)}>
            Add Burger
          </Button>
        </Grid>
        <Grid item>
          <Button variant="contained" color="success" onClick={() => handleAddItem("Soda", 1)}>
            Add Soda
          </Button>
        </Grid>
      </Grid>
      <Button variant="contained" color="primary" onClick={handleSubmit}>
        Submit Order
      </Button>
    </Box>
  );
};

export default OrderForm;
