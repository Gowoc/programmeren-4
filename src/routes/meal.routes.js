const express = require("express");
const router = express.Router();
const mealController = require("../controllers/meal.controller")
const authenticationMiddleware = require("../middleware/authentication.middleware")

router.get("", mealController.allMeals);
router.post("",authenticationMiddleware, mealController.newMeal);
router.get("/:mealId", mealController.mealByID);
router.delete("/:mealId",authenticationMiddleware, mealController.deleteMeal);

module.exports = router;
