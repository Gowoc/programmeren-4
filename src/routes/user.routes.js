const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller")
const authenticationMiddleware = require("../middleware/authentication.middleware")

router.post("", userController.newUser);
router.get("", authenticationMiddleware, userController.allUsers);
router.get("/:userId", authenticationMiddleware, userController.userByID);
router.put("/:userId",authenticationMiddleware, userController.editUser);
router.delete("/:userId",authenticationMiddleware, userController.deleteUser);

module.exports = router;
