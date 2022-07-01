const express = require('express')
const userRoutes = require("./src/routes/user.routes")
const app = express()
app.use(express.json());

app.use(function (req, res, next) {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE, OPTIONS");
	res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type, Authorization");
	res.setHeader("Access-Control-Allow-Credentials", true);
	next();
});

const port = 3000

app.use("/api/users", userRoutes);

app.all("*", function (req,res) {
    res.status(404).json({
        error: "Endpoint does not exist",
    });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})