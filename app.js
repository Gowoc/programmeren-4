const express = require('express')
const userRoutes = require("./src/routes/user.routes")
const app = express()
const bodyParser = require('body-parser');

app.use(bodyParser.json());

app.use(function (req, res, next) {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE, OPTIONS");
	res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type, Authorization");
	res.setHeader("Access-Control-Allow-Credentials", true);
	next();
});

const port = process.env.port || 3000;

app.all('*', (req,res,next) => {
    const method = req.method;
    console.log(`Method ${method} called`);
    next();
})

app.use("/api/users", userRoutes);

app.all("*", (req,res) => {
    res.status(404).json({
        error: "Endpoint does not exist",
    });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})