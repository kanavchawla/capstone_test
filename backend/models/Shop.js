const mongoose = require("mongoose");
const { Schema } = mongoose;

const shopSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  menu: [
    {
      item: { type: String, required: true },
      price: { type: Number, required: true },
    },
  ],
});

module.exports = mongoose.model("Shop", shopSchema);
