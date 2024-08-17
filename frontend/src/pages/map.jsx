import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Container,
  CircularProgress,
} from "@mui/material";

const MappedinMap = () => {
  const [loading, setLoading] = useState(true);

  const handleLoad = () => {
    setLoading(false);
  };

  return (
    <Container>
      <Typography
        variant="h3"
        component="h1"
        gutterBottom
        sx={{
          fontWeight: "bold",
          textAlign: "center",
          mt: 4, // Margin top for spacing
          mb: 4, // Margin bottom for spacing
        }}
      >
        Welcome to Our Interactive Map
      </Typography>

      <Card
        elevation={10}
        sx={{
          maxWidth: "100%",
          mb: 4,
          backdropFilter: "blur(10px)",
          background: "rgba(255, 255, 255, 0.1)", // Glass effect background
          color: "white",
          borderRadius: 3,
          border: "1px solid rgba(255, 255, 255, 0.3)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.37)", // Soft shadow for the 3D effect
          overflow: "hidden",
          position: "relative", // For positioning the overlay inside the card
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Typography
            variant="h4"
            component="div"
            gutterBottom
            sx={{ fontWeight: "bold", textAlign: "center", color: "black" }}
          >
            Explore the Mappedin Map
          </Typography>
          <Box
            sx={{
              mt: 2,
              borderRadius: 2,
              overflow: "hidden",
              position: "relative", // Relative positioning for loader placement
            }}
          >
            {loading && (
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  backgroundColor: "rgba(255, 255, 255, 0.8)", // Semi-transparent background
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 10, // Ensures the loader appears on top
                }}
              >
                <CircularProgress />
              </Box>
            )}
            <iframe
              title="Mappedin Map"
              name="Mappedin Map"
              allow="clipboard-write; web-share"
              scrolling="no"
              width="100%"
              height="650"
              frameBorder="0"
              style={{
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "8px", // Smooth border for a clean look
              }}
              src="https://app.mappedin.com/map/669e3511a7df44000bac1a9a?embedded=true"
              onLoad={handleLoad} // Loader disappears once iframe is loaded
            ></iframe>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default MappedinMap;
