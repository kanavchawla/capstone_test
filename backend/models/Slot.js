const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema({
  number: { type: Number, required: true, unique: true }, // Slot number
  status: {
    type: String,
    enum: ["empty", "booked", "occupied"],
    default: "empty",
  },
  duration: { type: Number }, // Duration in seconds (default 5 minutes)
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ParkingUser",
    default: null,
  }, // Linked user
  bookedAt: { type: Date, default: null }, // Time when the slot was booked
});

module.exports = mongoose.model("Slot", slotSchema);
