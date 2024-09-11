import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Container,
  CircularProgress,
  Box,
  Alert,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from "@mui/material";
import { Add, Remove } from "@mui/icons-material";
import { useSelector } from "react-redux";
import { selectUserInfo } from "../features/user/UserSlice";

const ShopMenu = () => {
  const userInfo = useSelector(selectUserInfo);
  const { id } = useParams();
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState({});
  const [orderData, setOrderData] = useState(null);
  const navigate = useNavigate(); // Use navigate from react-router

  useEffect(() => {
    const fetchShop = async () => {
      try {
        const response = await fetch(`http://localhost:8000/shops/${id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setShop(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchShop();
  }, [id]);

  const addToCart = (menuItem) => {
    setCart((prevCart) => {
      const updatedCart = { ...prevCart };
      if (updatedCart[menuItem._id]) {
        updatedCart[menuItem._id].quantity += 1;
      } else {
        updatedCart[menuItem._id] = { ...menuItem, quantity: 1 };
      }
      return updatedCart;
    });
  };

  const removeFromCart = (menuItem) => {
    setCart((prevCart) => {
      const updatedCart = { ...prevCart };
      if (updatedCart[menuItem._id]) {
        if (updatedCart[menuItem._id].quantity > 1) {
          updatedCart[menuItem._id].quantity -= 1;
        } else {
          delete updatedCart[menuItem._id];
        }
      }
      return updatedCart;
    });
  };

  const handleSubmitOrder = async () => {
    const orderItems = Object.values(cart).map((item) => ({
      _id: item._id,
      item: item.item,
      price: item.price,
      quantity: item.quantity,
    }));

    try {
      const response = await fetch("http://localhost:8000/food-orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userInfo._id,
          shopId: id,
          items: orderItems,
        }),
      });

      if (!response.ok) {
        throw new Error("Order submission failed");
      }

      const data = await response.json();

      // Set the order data
      setOrderData({
        orderId: data.foodOrder._id,
        shopId: id,
        userId: userInfo._id,
      });

      // Navigate to the QR code page and pass the order data in the URL
      const qrCodeURL = `/qr-code?orderId=${data.foodOrder._id}&shopId=${id}&userId=${userInfo._id}`;
      navigate(qrCodeURL);

      setCart({});
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
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

  return (
    <Container>
      {shop && (
        <>
          <Typography variant="h4" align="center" gutterBottom>
            {shop.name} - Menu
          </Typography>
          <Typography variant="body1" align="center" gutterBottom>
            Location: {shop.location}
          </Typography>

          <Grid container spacing={4}>
            {shop.menu.map((menuItem) => (
              <Grid item key={menuItem._id} xs={12} sm={6} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">{menuItem.item}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      ${menuItem.price.toFixed(2)}
                    </Typography>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      mt={2}
                    >
                      <Button
                        variant="contained"
                        onClick={() => addToCart(menuItem)}
                      >
                        Add
                      </Button>
                      <IconButton onClick={() => removeFromCart(menuItem)}>
                        <Remove />
                      </IconButton>
                      <Typography>
                        {cart[menuItem._id] ? cart[menuItem._id].quantity : 0}
                      </Typography>
                      <IconButton onClick={() => addToCart(menuItem)}>
                        <Add />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box mt={4}>
            <Typography variant="h5" gutterBottom>
              Cart
            </Typography>
            <List>
              {Object.values(cart).map((item) => (
                <ListItem key={item._id}>
                  <ListItemText
                    primary={`${item.item} - $${item.price.toFixed(2)} x ${
                      item.quantity
                    }`}
                  />
                </ListItem>
              ))}
            </List>
            {Object.keys(cart).length > 0 && (
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmitOrder}
              >
                Submit Order
              </Button>
            )}
          </Box>
        </>
      )}
    </Container>
  );
};

export default ShopMenu;
