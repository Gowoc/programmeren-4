const express = require('express')
const userRoutes = require("./src/routes/user.routes")
const mealRoutes = require("./src/routes/meal.routes")
const authRoutes = require("./src/routes/auth.routes")
const app = express()
const bodyParser = require('body-parser');
require("dotenv").config();

app.use(bodyParser.json());

app.use(function (req, res, next) {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE, OPTIONS");
	res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type, Authorization");
	res.setHeader("Access-Control-Allow-Credentials", true);
	next();
});

const port = process.env.PORT;

app.all('*', (req,res,next) => {
    const method = req.method;
    console.log(`Method ${method} called`);
    next();
})

app.use("/api/user", userRoutes);
app.use("/api/meal", mealRoutes);
app.use("/api/auth", authRoutes);

app.all("*", (req,res) => {
    res.status(404).json({
        error: "Endpoint does not exist",
    });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

module.exports=app