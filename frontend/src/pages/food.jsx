import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Grid,
  Box,
  CircularProgress,
  Container,
} from "@mui/material";
import { Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUserInfo } from "../features/user/UserSlice";
import { Navbar } from "../features/navigation/components/Navbar";
import { Footer } from "../features/footer/Footer";

const ShopDetails = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Add navigation hook

  // Predefined image array with specific images for first two shops
  const imageUrls = [
    { name: "sweet", url: "../assets/sweet.jpeg" },
    { name: "pizza", url: "../assets/pizza.jpeg" },
    { name: "pasta", url: "../assets/pasta.jpeg" },
    { name: "taco", url: "../assets/taco.jpeg" },
    { name: "sushi", url: "../assets/sushi.jpeg" },
    { name: "burger", url: "../assets/burger.jpeg" },
  ];

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const response = await fetch("http://localhost:8000/shops");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setShops(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchShops();
  }, []);

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
      <Navbar></Navbar>
      <Typography variant="h4" align="center" gutterBottom>
        Explore Restaurants
      </Typography>

      <Grid container spacing={6}>
        {shops.map((shop, index) => {
          // Use predefined image URLs for the first two shops
          const imageUrl =
            index < imageUrls.length
              ? imageUrls[index].url
              : `https://via.placeholder.com/250?text=${shop.name}`;

          return (
            <Grid item key={shop._id} xs={12} sm={6} md={4}>
              <Card
                onClick={() => navigate(`/shop/${shop._id}`)} // Redirect on card click
                style={{ cursor: "pointer" }} // Make card clickable
              >
                <CardMedia
                  component="img"
                  height="140"
                  image={imageUrl}
                  alt={shop.name}
                />
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                    {shop.name}
                  </Typography>
                  {/* <Typography variant="body2" color="textSecondary">
                    {shop.location}
                  </Typography> */}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Container>
  );
};

export default ShopDetails;
