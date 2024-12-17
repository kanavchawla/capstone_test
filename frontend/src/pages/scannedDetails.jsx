import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Box, Typography, CircularProgress, Container, Alert } from "@mui/material";

const ScannedDetails = () => {
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Use the useLocation hook to get the query parameters
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const orderId = queryParams.get("orderId");
  const shopId = queryParams.get("shopId");
  const userId = queryParams.get("userId");

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        // Fetch order details using the orderId, shopId, and userId
        const response = await fetch(
          `http://localhost:8000/food-orders/${orderId}?shopId=${shopId}&userId=${userId}`
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch order details`);
        }
        const data = await response.json();
        setOrderDetails(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId, shopId, userId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container>
      {orderDetails ? (
        <Box mt={4}>
          <Typography variant="h4" gutterBottom>
            Order Details
          </Typography>
          <Typography variant="h6" gutterBottom>
            Order ID: {orderDetails._id}
          </Typography>
          <Typography variant="body1" gutterBottom>
            Shop ID: {orderDetails.shop._id}
          </Typography>
          <Typography variant="body1" gutterBottom>
            User ID: {orderDetails.user._id}
          </Typography>
          <Typography variant="body1" gutterBottom>
            Order Items: {orderDetails.items.join(", ")}
          </Typography>
          <Typography variant="body1" gutterBottom>
            Total Price: {orderDetails.totalPrice}
          </Typography>
        </Box>
      ) : (
        <Typography variant="body1" gutterBottom>
          No order details found.
        </Typography>
      )}
    </Container>
  );
};

export default ScannedDetails;
