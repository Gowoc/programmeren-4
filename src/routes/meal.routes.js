const express = require("express");
const router = express.Router();
const mealController = require("../controllers/meal.controller")
const authenticationMiddleware = require("../middleware/authentication.middleware")

router.get("", authenticationMiddleware, mealController.allMeals);
router.post("",authenticationMiddleware, mealController.newMeal);
router.get("/:mealId", authenticationMiddleware, mealController.mealByID);
router.delete("/:mealId",authenticationMiddleware, mealController.deleteMeal);

module.exports = router;
