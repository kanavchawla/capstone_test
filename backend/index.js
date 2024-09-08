require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

// Import Routes
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
const shopRoutes = require("./routes/Shop"); // Import shop routes

// Import models
const User = require("./models/User");
const FoodOrder = require("./models/FoodOrder");
const Shop = require("./models/Shop");

const { connectToDB } = require("./database/db");

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
server.use("/shops", shopRoutes); // Use shop routes

// Food Orders route
// Food Orders route
server.post("/food-orders", async (req, res) => {
  try {
    const { userId, shopId, items } = req.body;

    // Validate user and shop
    const user = await User.findById(userId);
    const shop = await Shop.findById(shopId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }

    // Create a new food order with user, shop, and items
    const newFoodOrder = new FoodOrder({
      user: user._id,
      shop: shop._id,
      items: items, // Array of items with {item, price, quantity}
    });

    // Save the food order to the database
    const savedFoodOrder = await newFoodOrder.save();

    res.status(201).json({
      message: "Food order placed successfully",
      foodOrder: savedFoodOrder,
    });
  } catch (error) {
    res.status(500).json({ message: "Error placing food order", error });
  }
});

// Get a specific food order with shop details
server.get("/food-orders/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await FoodOrder.findById(orderId)
      .populate("user", "firstname lastname email")
      .populate("shop", "name location");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: "Error fetching order", error });
  }
});

// Update order status
server.patch("/food-orders/:orderId/status", async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    // Validate that status is one of the allowed values
    const allowedStatuses = [
      "pending",
      "confirmed",
      "in progress",
      "completed",
      "cancelled",
    ];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await FoodOrder.findByIdAndUpdate(
      orderId,
      { status },
      { new: true } // Return the updated document
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ message: "Order status updated", order });
  } catch (error) {
    res.status(500).json({ message: "Error updating order status", error });
  }
});

// Root route
server.get("/", (req, res) => {
  res.status(200).json({ message: "running" });
});

server.get("/orders/:shopId/:orderId", async (req, res) => {
  try {
    const { shopId, orderId } = req.params;
    const order = await FoodOrder.findOne({ _id: orderId, shop: shopId })
      .populate("user", "firstname lastname email")
      .populate("shop", "name location");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: "Error fetching order", error });
  }
});

// Start server
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`server [STARTED] ~ http://localhost:${PORT}`);
});
