import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectUserInfo } from "../features/user/UserSlice";
import { QRCodeCanvas } from "qrcode.react";
import { Button, Box, Typography, List, ListItem, ListItemText } from "@mui/material";
import { useNavigate } from "react-router-dom";  // Import useNavigate

const UserOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showQRCode, setShowQRCode] = useState(null); // State to manage which QR code to show

  // Get userInfo from the Redux store
  const userInfo = useSelector(selectUserInfo);
  const userId = userInfo?._id;

  const navigate = useNavigate();  // Initialize navigate

  useEffect(() => {
    if (userId) {
      const fetchOrders = async () => {
        try {
          setLoading(true);
          const response = await fetch(`http://localhost:8000/food-orders/user/${userId}`);
          if (!response.ok) {
            throw new Error("Failed to fetch orders");
          }
          const data = await response.json();
          setOrders(data);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      fetchOrders();
    }
  }, [userId]);

  const handleQRCodeClick = (orderId, shopId) => {
    // Navigate to the QR code URL with query parameters
    navigate(`/qr-code?orderId=${orderId}&shopId=${shopId}&userId=${userId}`);
  };

  if (loading) return <div>Loading orders...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>User Orders</h2>
      {orders.length === 0 ? (
        <p>No orders found</p>
      ) : (
        <List>
          {orders.map((order) => (
            <ListItem key={order._id}>
              <ListItemText
                primary={`Order ID: ${order._id}`}
                secondary={`Shop ID: ${order.shop._id}`}  // Display the shop ID here
              />
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleQRCodeClick(order._id, order.shop._id)} // Pass orderId and shopId
              >
                Show QR Code
              </Button>
            </ListItem>
          ))}
        </List>
      )}
    </div>
  );
};

export default UserOrders;
