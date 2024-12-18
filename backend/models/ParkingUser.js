const mongoose = require("mongoose");

const parkingUserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  carNumber: { type: String, required: true },
  slotInfo: {
    slotNumber: { type: Number, default: null },
    isOccupied: { type: Boolean, default: false },
    booked: { type: Boolean, default: false },
    duration: { type: Number, default: 0 }, // in seconds
  },
});

module.exports = mongoose.model("ParkingUser", parkingUserSchema);
