const express = require("express");
const FoodController = require("../controllers/food.controller");

const router = express.Router();

// Alimentos do dia
router.get("/today/:userId", FoodController.getTodayFoods);
router.post("/add", FoodController.addFood);

module.exports = router;
