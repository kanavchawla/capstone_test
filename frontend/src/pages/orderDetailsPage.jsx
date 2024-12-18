import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  Button,
} from "@mui/material";

const OrderDetailsPage = () => {
  const { orderId, shopId } = useParams(); // Get orderId and shopId from URL params
  const navigate = useNavigate(); // Used for navigation
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/orders/${shopId}/${orderId}`
        );
        if (!response.ok) {
          throw new Error("Error fetching order details");
        }
        const data = await response.json();
        setOrderDetails(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, shopId]);

  const handleGoToAdminDashboard = () => {
    // Assuming the admin route is '/admin/food-dashboard'
    navigate("/admin/food-dashboard");
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!orderDetails) {
    return (
      <Container>
        <Typography variant="h6">No order details found</Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h5">Order Details</Typography>
      <Box mt={2}>
        <Typography variant="h6">Order ID: {orderDetails._id}</Typography>
        <Typography variant="h6">Shop ID: {orderDetails.shop._id}</Typography>
        <Typography variant="h6">User ID: {orderDetails.user._id}</Typography>

        {/* List of items */}
        <List>
          {orderDetails.items.map((item) => (
            <ListItem key={item._id}>
              <ListItemText
                primary={`${item.item} x ${item.quantity}`}
                secondary={`Price: Rs. ${item.price.toFixed(2)}`}
              />
            </ListItem>
          ))}
        </List>

        <Divider />

        <Typography variant="h6" align="right" mt={2}>
          Total Amount: Rs.{" "}
          {orderDetails.items
            .reduce((total, item) => total + item.price * item.quantity, 0)
            .toFixed(2)}
        </Typography>
      </Box>

      {/* Button to navigate to the admin dashboard */}
      <Box mt={4} display="flex" justifyContent="center">
        <Button
          variant="contained"
          color="primary"
          onClick={handleGoToAdminDashboard}
        >
          Go to Admin Dashboard
        </Button>
      </Box>
    </Container>
  );
};

export default OrderDetailsPage;
