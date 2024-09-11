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

const ShopDetails = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Add navigation hook

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
      <Typography variant="h4" align="center" gutterBottom>
        Explore Restaurants
      </Typography>

      <Grid container spacing={4}>
        {shops.map((shop) => (
          <Grid item key={shop._id} xs={12} sm={6} md={4}>
            <Card
              onClick={() => navigate(`/shop/${shop._id}`)} // Redirect on card click
              style={{ cursor: "pointer" }} // Make card clickable
            >
              <CardMedia
                component="img"
                height="140"
                image={`https://via.placeholder.com/250?text=${shop.name}`}
                alt={shop.name}
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  {shop.name}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {shop.location}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default ShopDetails;
