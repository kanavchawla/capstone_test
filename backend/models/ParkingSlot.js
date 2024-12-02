const mongoose = require('mongoose');

const parkingSlotSchema = new mongoose.Schema({
  floorNumber: {
    type: Number,
    required: true,
  },
  slotNumber: {
    type: String,
    required: true,
  },
  isOccupied: {
    type: Boolean,
    required: true,
    default: false,
  },
  vehicleDetails: {
    vehicleNumber: {
      type: String,
      required: function() { return this.isOccupied; },
    },
    vehicleType: {
      type: String,
      enum: ['Car', 'Bike', 'Truck'], // You can add more types as needed
    },
    entryTime: {
      type: Date,
      required: function() { return this.isOccupied; },
    }
  }
});

const ParkingSlot = mongoose.model('ParkingSlot', parkingSlotSchema);

module.exports = ParkingSlot;
