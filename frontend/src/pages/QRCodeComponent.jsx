import React from "react";
import { useLocation } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import { Container, Typography, Box } from "@mui/material";

const QRCodePage = () => {
  // Access the order data from the location state
  const location = useLocation();
  const { orderData } = location.state || {};

  if (!orderData) {
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
        <QRCodeCanvas value={JSON.stringify(orderData)} size={256} />
        <Typography mt={2}>
          Scan this QR code to view your order details.
        </Typography>
      </Box>
    </Container>
  );
};

export default QRCodePage;
