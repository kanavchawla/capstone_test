require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/Auth");
const productRoutes = require("./routes/Product");
const orderRoutes = require("./routes/Order");
const cartRoutes = require("./routes/Cart");
const brandRoutes = require("./routes/Brand");
const categoryRoutes = require("./routes/Category");
const userRoutes = require("./routes/User");
const addressRoutes = require("./routes/Address");
const reviewRoutes = require("./routes/Review");
const wishlistRoutes = require("./routes/Wishlist");
const { connectToDB } = require("./database/db");

// Import models
const User = require("./models/User");
const FoodOrder = require("./models/FoodOrder");

const server = express();

// Database connection
connectToDB();

// Middlewares
server.use(
  cors({
    origin: process.env.ORIGIN,
    credentials: true,
    exposedHeaders: ["X-Total-Count"],
    methods: ["GET", "POST", "PATCH", "DELETE"],
  })
);
server.use(express.json());
server.use(cookieParser());
server.use(morgan("tiny"));

// Route middlewares
server.use("/auth", authRoutes);
server.use("/users", userRoutes);
server.use("/products", productRoutes);
server.use("/orders", orderRoutes);
server.use("/cart", cartRoutes);
server.use("/brands", brandRoutes);
server.use("/categories", categoryRoutes);
server.use("/address", addressRoutes);
server.use("/reviews", reviewRoutes);
server.use("/wishlist", wishlistRoutes);

// Food Orders route
server.post("/food-orders", async (req, res) => {
  try {
    const { userId, items } = req.body;

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create a new food order
    const newFoodOrder = new FoodOrder({
      user: user._id,
      items: items,
    });

    // Save the food order to the database
    const savedFoodOrder = await newFoodOrder.save();

    res.status(201).json({ message: "Food order placed successfully", foodOrder: savedFoodOrder });
  } catch (error) {
    res.status(500).json({ message: "Error placing food order", error });
  }
});

server.get("/food-orders/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await FoodOrder.findById(orderId).populate('user');

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: "Error fetching order", error });
  }
});


// Root route
server.get("/", (req, res) => {
  res.status(200).json({ message: "running" });
});

// Start server
server.listen(8000, () => {
  console.log("server [STARTED] ~ http://localhost:8000");
});
