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
  secret: { type: String, required: true } // Ensure this field is required
});


module.exports = mongoose.model("Shop", shopSchema);
