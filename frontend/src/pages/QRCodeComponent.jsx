import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Alert,
  Divider,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import { styled } from "@mui/material/styles";

// Stepper Steps Enumeration
const orderStages = ["pending", "confirmed", "in progress", "completed"];

const HighlightedStep = styled(Step)(({ theme }) => ({
  "& .MuiStepLabel-root": {
    color: theme.palette.primary.main,
  },
}));

const QRCodePage = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const orderId = searchParams.get("orderId");
  const shopId = searchParams.get("shopId");
  const userId = searchParams.get("userId");

  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderStatus, setOrderStatus] = useState(0); // For tracking order status (index for Stepper)

  useEffect(() => {
    // Fetch order details by orderId
    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/food-orders/${orderId}`
        );
        if (!response.ok) {
          throw new Error(`Error fetching order: ${response.status}`);
        }
        const data = await response.json();
        setOrderDetails(data);

        // Map string status to index
        const statusIndex = orderStages.indexOf(data.status);
        setOrderStatus(statusIndex === -1 ? 0 : statusIndex); // Default to 0 if status is invalid

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const calculateTotalAmount = () => {
    if (!orderDetails) return 0;
    return orderDetails.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
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

  if (!orderDetails) {
    return (
      <Container>
        <Typography variant="h6" align="center" gutterBottom>
          No order data found.
        </Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Box mt={4} display="flex" flexDirection="column" alignItems="center">
        <Typography variant="h5" gutterBottom>
          Your Order QR Code
        </Typography>
        <QRCodeCanvas
          value={JSON.stringify({ orderId, shopId, userId })}
          size={256}
        />
        <Typography mt={2}>
          Scan this QR code to view your order details.
        </Typography>
      </Box>

      {/* Timeline/Stepper for Order Status */}
      <Box mt={4}>
        <Typography variant="h6" gutterBottom>
          Order Status
        </Typography>
        <Stepper activeStep={orderStatus} alternativeLabel>
          {orderStages.map((label, index) => (
            <HighlightedStep key={label}>
              <StepLabel
                sx={{
                  color:
                    index === orderStatus ? "primary.main" : "text.secondary",
                  fontWeight: index === orderStatus ? "bold" : "normal",
                }}
              >
                {label.charAt(0).toUpperCase() + label.slice(1)}{" "}
                {/* Capitalize first letter */}
              </StepLabel>
            </HighlightedStep>
          ))}
        </Stepper>
      </Box>

      {/* Order Details */}
      <Box mt={4}>
        <Typography variant="h6" gutterBottom>
          Order Details:
        </Typography>
        <List>
          {orderDetails.items.map((item) => (
            <ListItem key={item._id}>
              <ListItemText
                primary={`${item.item} x ${item.quantity}`}
                secondary={`Price: $${item.price.toFixed(2)}`}
              />
            </ListItem>
          ))}
        </List>
        <Divider />
        <Typography variant="h6" align="right" mt={2}>
          Total Amount: ${calculateTotalAmount().toFixed(2)}
        </Typography>
      </Box>
    </Container>
  );
};

export default QRCodePage;
