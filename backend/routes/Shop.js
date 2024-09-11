const express = require("express");
const router = express.Router();
const Shop = require("../models/Shop");

// @route    POST /shops
// @desc     Create a new shop
router.post("/", async (req, res) => {
  try {
    const { name, location, menu } = req.body;

    // Create a new shop
    const newShop = new Shop({
      name,
      location,
      menu, // This should correctly save the array to MongoDB
    });

    // Save the shop to the database
    const savedShop = await newShop.save();

    res.status(201).json({
      message: "Shop created successfully",
      shop: savedShop,
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating shop", error });
  }
});

// @route    GET /shops
// @desc     Get all shops
router.get("/", async (req, res) => {
  try {
    const shops = await Shop.find();
    res.status(200).json(shops);
  } catch (error) {
    res.status(500).json({ message: "Error fetching shops", error });
  }
});

// @route    GET /shops/:shopId
// @desc     Get a specific shop by ID
router.get("/:shopId", async (req, res) => {
  try {
    const { shopId } = req.params;
    const shop = await Shop.findById(shopId);

    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }

    res.status(200).json(shop);
  } catch (error) {
    res.status(500).json({ message: "Error fetching shop", error });
  }
});

// @route    PUT /shops/:shopId
// @desc     Update a shop
router.put("/:shopId", async (req, res) => {
  try {
    const { shopId } = req.params;
    const { name, location, description } = req.body;

    const updatedShop = await Shop.findByIdAndUpdate(
      shopId,
      { name, location, description },
      { new: true, runValidators: true }
    );

    if (!updatedShop) {
      return res.status(404).json({ message: "Shop not found" });
    }

    res
      .status(200)
      .json({ message: "Shop updated successfully", shop: updatedShop });
  } catch (error) {
    res.status(500).json({ message: "Error updating shop", error });
  }
});

// @route    DELETE /shops/:shopId
// @desc     Delete a shop
router.delete("/:shopId", async (req, res) => {
  try {
    const { shopId } = req.params;
    const deletedShop = await Shop.findByIdAndDelete(shopId);

    if (!deletedShop) {
      return res.status(404).json({ message: "Shop not found" });
    }

    res.status(200).json({ message: "Shop deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting shop", error });
  }
});

module.exports = router;
