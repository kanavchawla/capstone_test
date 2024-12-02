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
const ParkingSlot = require('./models/ParkingSlot');  // Assuming the schema file is in models directory

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
// Route to verify the shop secret
server.post("/shops/verify-secret", async (req, res) => {
  try {
    const { shopSecret } = req.body;

    if (!shopSecret) {
      return res.status(400).json({ message: "Shop secret is required" });
    }

    // Find the shop with the provided secret
    const shop = await Shop.findOne({ secret: shopSecret });

    if (!shop) {
      return res.status(403).json({ message: "Invalid shop secret" });
    }

    res.status(200).json({ message: "Shop secret is valid", shop });
  } catch (error) {
    res.status(500).json({ message: "Error verifying shop secret", error });
  }
});


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

server.get('/food-orders/:orderId', async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate('user'); // Populate user details
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(400).json({ message: 'Error fetching order', error }); // Respond with 400 for bad request
  }
});

server.get("/food-orders/shop/:shopId", async (req, res) => {
  try {
    const { shopId } = req.params; // Get the shopId from URL parameters

    // Find the shop by ID to ensure it exists
    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }

    // Find all food orders for the given shop
    const orders = await FoodOrder.find({ shop: shopId })
      .populate("user", "firstname lastname email") // Populate user details
      .populate("shop", "name location"); // Populate shop details

    if (orders.length === 0) {
      return res.status(404).json({ message: "No orders found for this shop" });
    }

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders", error });
  }
});


server.patch('/food-orders/:orderId/status', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, shopSecret } = req.body;

    console.log("Request Data:", { orderId, status, shopSecret });

    // Validate the status
    const allowedStatuses = ["pending", "confirmed", "in progress", "completed", "cancelled"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // Find the order by ID and populate the shop
    const order = await FoodOrder.findById(orderId).populate("shop");
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    console.log("Order Data:", order);

    // Verify the shop secret
    if (order.shop.secret !== shopSecret) {
      return res.status(403).json({ message: "Unauthorized to update this order" });
    }

    // Update the order status
    order.status = status;
    const updatedOrder = await order.save();

    res.status(200).json({ message: "Order status updated successfully", order: updatedOrder });
  } catch (error) {
    console.error("Error updating order status:", error); // Detailed error logging
    res.status(500).json({ message: "Error updating order status", error: error.message }); // Detailed error response
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


server.get("/status/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await FoodOrder.findById(orderId).select('status'); // Adjust field selection as needed

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ status: order.status });
  } catch (error) {
    res.status(500).json({ message: "Error fetching order status", error });
  }
});


server.get('/slots', async (req, res) => {
  try {
    const slots = await ParkingSlot.find();
    res.json(slots);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Route to add a new parking slot
server.post('/slots', async (req, res) => {
  const slot = new ParkingSlot({
    floorNumber: req.body.floorNumber,
    slotNumber: req.body.slotNumber,
    isOccupied: req.body.isOccupied,
    vehicleDetails: req.body.isOccupied ? req.body.vehicleDetails : null
  });

  try {
    const newSlot = await slot.save();
    res.status(201).json(newSlot);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Route to update the status of a parking slot (e.g., when a vehicle is parked)
server.patch('/slots/:id', async (req, res) => {
  try {
    const slot = await ParkingSlot.findById(req.params.id);
    if (!slot) {
      return res.status(404).json({ message: 'Parking slot not found' });
    }

    if (req.body.isOccupied !== undefined) {
      slot.isOccupied = req.body.isOccupied;
      if (req.body.isOccupied) {
        slot.vehicleDetails = req.body.vehicleDetails;
      } else {
        slot.vehicleDetails = null;
      }
    }

    const updatedSlot = await slot.save();
    res.json(updatedSlot);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Route to delete a parking slot
server.delete('/slots/:id', async (req, res) => {
  try {
    const slot = await ParkingSlot.findById(req.params.id);
    if (!slot) {
      return res.status(404).json({ message: 'Parking slot not found' });
    }

    await slot.remove();
    res.json({ message: 'Parking slot deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Start server
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`server [STARTED] ~ http://localhost:${PORT}`);
});
