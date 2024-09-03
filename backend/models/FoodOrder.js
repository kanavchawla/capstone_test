const mongoose = require("mongoose");
const { Schema } = mongoose;

const foodOrderSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    items: [
        {
            item: { type: String, required: true },
            quantity: { type: Number, required: true, default: 1 }
        }
    ],
    status: {
        type: String,
        enum: ["Pending", "Shipped", "Delivered", "Cancelled"],
        default: "Pending"
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("FoodOrder", foodOrderSchema);
