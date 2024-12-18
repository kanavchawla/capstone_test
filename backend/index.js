require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const path = require("path");

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
const ParkingSlot = require("./models/ParkingSlot"); // Assuming the schema file is in models directory

// Import models
const User = require("./models/User");
const FoodOrder = require("./models/FoodOrder");
const Shop = require("./models/Shop");
const ParkingUser = require("./models/ParkingUser");
const Slot = require("./models/Slot");
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

const sensorSchema = new mongoose.Schema({
  distance: Number,
  timestamp: Number, // Time in seconds
});

const SensorData = mongoose.model("SensorData", sensorSchema);

server.post("/update", async (req, res) => {
  try {
    const { distance, timestamp } = req.body;

    const newData = new SensorData({ distance, timestamp });
    await newData.save();

    res.status(200).send("Data saved successfully!");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error saving data.");
  }
});

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

server.get("/food-orders/:orderId", async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate("user"); // Populate user details
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(400).json({ message: "Error fetching order", error }); // Respond with 400 for bad request
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

server.patch("/food-orders/:orderId/status", async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, shopSecret } = req.body;

    console.log("Request Data:", { orderId, status, shopSecret });

    // Validate the status
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

    // Find the order by ID and populate the shop
    const order = await FoodOrder.findById(orderId).populate("shop");
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    console.log("Order Data:", order);

    // Verify the shop secret
    if (order.shop.secret !== shopSecret) {
      return res
        .status(403)
        .json({ message: "Unauthorized to update this order" });
    }

    // Update the order status
    order.status = status;
    const updatedOrder = await order.save();

    res.status(200).json({
      message: "Order status updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Error updating order status:", error); // Detailed error logging
    res
      .status(500)
      .json({ message: "Error updating order status", error: error.message }); // Detailed error response
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
    const order = await FoodOrder.findById(orderId).select("status"); // Adjust field selection as needed

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ status: order.status });
  } catch (error) {
    res.status(500).json({ message: "Error fetching order status", error });
  }
});

server.get("/slots", async (req, res) => {
  try {
    const slots = await ParkingSlot.find();
    res.json(slots);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Route to add a new parking slot
server.post("/slots", async (req, res) => {
  const slot = new ParkingSlot({
    floorNumber: req.body.floorNumber,
    slotNumber: req.body.slotNumber,
    isOccupied: req.body.isOccupied,
    vehicleDetails: req.body.isOccupied ? req.body.vehicleDetails : null,
  });

  try {
    const newSlot = await slot.save();
    res.status(201).json(newSlot);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Route to update the status of a parking slot (e.g., when a vehicle is parked)
server.patch("/slots/:id", async (req, res) => {
  try {
    const slot = await ParkingSlot.findById(req.params.id);
    if (!slot) {
      return res.status(404).json({ message: "Parking slot not found" });
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
server.delete("/slots/:id", async (req, res) => {
  try {
    const slot = await ParkingSlot.findById(req.params.id);
    if (!slot) {
      return res.status(404).json({ message: "Parking slot not found" });
    }

    await slot.remove();
    res.json({ message: "Parking slot deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all orders for a specific user
server.get("/food-orders/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate user existence
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch all orders for the user
    const orders = await FoodOrder.find({ user: userId })
      .populate("shop", "name location") // Populate shop details
      .populate("user", "firstname lastname email"); // Optional: Populate user details

    if (orders.length === 0) {
      return res.status(404).json({ message: "No orders found for this user" });
    }

    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching user's orders:", error);
    res.status(500).json({ message: "Error fetching orders", error });
  }
});

server.post("/api/parking-user", async (req, res) => {
  try {
    const { carNumber } = req.body;

    const existingUser = await ParkingUser.findOne({ carNumber });
    if (existingUser) {
      return res
        .status(200)
        .json({ message: "User already exists", user: existingUser });
    }

    const parkingUser = new ParkingUser(req.body);
    await parkingUser.save();
    res.status(201).json(parkingUser);
  } catch (error) {
    res.status(500).json({ error: "Error creating parking user" });
  }
});

// Get all slots
server.get("/api/slots", async (req, res) => {
  try {
    const slots = await Slot.find().populate("user", "name carNumber");
    res.json(slots);
  } catch (error) {
    res.status(500).json({ error: "Error fetching slots" });
  }
});

// Book a slot
server.post("/api/slots/book", async (req, res) => {
  const { slotNumber, parkingUserId } = req.body;

  try {
    // Check if the user has already booked a slot
    const existingBooking = await ParkingUser.findOne({ _id: parkingUserId });
    if (existingBooking && existingBooking.slotInfo?.booked) {
      return res
        .status(400)
        .json({ error: "You already have an active booking." });
    }

    // Check if the slot is available
    const slot = await Slot.findOne({ number: slotNumber });
    if (!slot || slot.status !== "empty") {
      return res.status(400).json({ error: "Slot is not available." });
    }

    // Set the slot as booked and store the booking time
    const now = new Date();
    const bookingDuration = 5 * 60 * 1000; // 5 minutes in milliseconds

    slot.status = "booked";
    slot.bookedAt = now; // Store the booking time
    slot.bookingDuration = bookingDuration; // Store the duration
    await slot.save();

    // Assign the slot to the user
    const user = await ParkingUser.findById(parkingUserId);
    user.slotInfo = { booked: true, slotNumber, bookedAt: now };
    await user.save();

    res.status(200).json({ slotNumber, user });
  } catch (error) {
    console.error("Error booking slot:", error);
    res.status(500).json({ error: "Error booking slot." });
  }
});

// Periodically clear expired slots (e.g., every minute)
const clearExpiredSlots = async () => {
  const now = new Date();

  const expiredSlots = await Slot.find({
    status: "booked",
    bookedAt: { $lt: new Date(now - 5 * 60 * 1000) }, // 5 minutes ago
  });

  expiredSlots.forEach(async (slot) => {
    slot.status = "empty"; // Set slot as empty
    slot.bookedAt = null; // Clear booking time
    slot.user = null; // Clear user assignment
    slot.bookingDuration = 0; // Reset duration
    await slot.save();
  });

  console.log("Expired slots cleared.");
};

// Run this function every minute
setInterval(clearExpiredSlots, 60 * 1000); // Clear expired slots every minute

// Mark a slot as occupied
server.post("/api/slots/occupy", async (req, res) => {
  const { slotNumber } = req.body;

  try {
    const slot = await Slot.findOneAndUpdate(
      { number: slotNumber, status: "booked" },
      { status: "occupied" },
      { new: true }
    );

    if (!slot) {
      return res.status(400).json({ error: "Slot not found or not booked" });
    }

    const parkingUserId = slot.user;
    await ParkingUser.findByIdAndUpdate(
      parkingUserId,
      {
        "slotInfo.isOccupied": true,
        "slotInfo.booked": false,
      },
      { new: true }
    );

    res.json(slot);
  } catch (error) {
    res.status(500).json({ error: "Error updating slot to occupied" });
  }
});

// Clear expired bookings
server.post("/api/slots/clear-expired", async (req, res) => {
  try {
    const expiredSlots = await Slot.find({
      status: "booked",
      bookedAt: { $lt: new Date(Date.now() - 5 * 60 * 1000) }, // Slots booked more than 5 minutes ago
    });

    const promises = expiredSlots.map((slot) =>
      Slot.findByIdAndUpdate(
        slot._id,
        { status: "empty", user: null, bookedAt: null, bookingDuration: 0 },
        { new: true }
      )
    );

    const results = await Promise.all(promises);

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: "Error clearing expired bookings" });
  }
});

// Timer decrement simulation (optional, for testing purposes)
server.post("/api/slots/decrement-timer", async (req, res) => {
  try {
    const slots = await Slot.find({ status: "booked" });

    const promises = slots.map((slot) =>
      Slot.findByIdAndUpdate(
        slot._id,
        { bookingDuration: Math.max(slot.bookingDuration - 1, 0) },
        { new: true }
      )
    );

    const updatedSlots = await Promise.all(promises);

    res.json(updatedSlots);
  } catch (error) {
    res.status(500).json({ error: "Error decrementing timers" });
  }
});

// Create a new slot
server.post("/api/slots/makenewslot", async (req, res) => {
  const { number, status, bookingDuration, user } = req.body;

  try {
    const existingSlot = await Slot.findOne({ number });
    if (existingSlot) {
      return res.status(400).json({ message: "Slot number already exists" });
    }

    const newSlot = new Slot({
      number,
      status,
      bookingDuration,
      user: user || null, // If no user provided, set it as null
    });

    await newSlot.save();
    return res
      .status(201)
      .json({ message: "Slot created successfully", slot: newSlot });
  } catch (error) {
    console.error("Error creating slot:", error);
    return res.status(500).json({ message: "Error creating slot", error });
  }
});

// Start server
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`server [STARTED] ~ http://localhost:${PORT}`);
});
