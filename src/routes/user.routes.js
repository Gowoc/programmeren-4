const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller")
const authenticationMiddleware = require("../middleware/authentication.middleware")

router.post("", authenticationMiddleware, userController.newUser);
router.get("", authenticationMiddleware, userController.allUsers);

module.exports = router;
