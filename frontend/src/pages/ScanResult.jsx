import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Button } from "@mui/material";
import { QrReader } from "react-qr-reader"; // Corrected import

const QRScanner = () => {
  const navigate = useNavigate(); // Use navigate hook
  const [scannedData, setScannedData] = useState(null); // To store the scanned QR code data
  const [isScanning, setIsScanning] = useState(true); // To check if the scanner is scanning

  // Handle the result after scanning the QR code
  const handleScan = (data) => {
    if (data) {
      setScannedData(JSON.parse(data)); // Store the scanned QR code data
      setIsScanning(false); // Stop scanning after getting the data
    }
  };

  // Handle error during scan
  const handleError = (err) => {
    console.error(err);
  };

  // Navigate to order details page after QR code scan
  const redirectToOrderDetails = () => {
    if (scannedData) {
      const { orderId, shopId, userId } = scannedData;
      navigate(`/order-details/${orderId}?shopId=${shopId}&userId=${userId}`);
    }
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" mt={4}>
      <Typography variant="h4" gutterBottom>
        Scan Your QR Code
      </Typography>

      {isScanning ? (
        <QrReader
          delay={300}
          style={{ width: "100%", maxWidth: 400 }}
          onResult={(result, error) => {
            if (result) {
              handleScan(result?.text); // Call handleScan when QR code is scanned
            }
            if (error) {
              handleError(error); // Handle any error during scan
            }
          }}
        />
      ) : (
        <Box display="flex" flexDirection="column" alignItems="center">
          <Typography variant="h6" gutterBottom>
            QR Code Scanned Successfully!
          </Typography>
          <Button variant="contained" color="primary" onClick={redirectToOrderDetails}>
            View Order Details
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default QRScanner;
