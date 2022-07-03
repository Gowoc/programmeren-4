const pool = require("../database/dbconnection")
const jwt = require('jsonwebtoken')

let controller = {

    login(req,res) {

        const { emailAdress, password } = req.body;
        if (emailAdress == null || password == null) {
            res.status(400).json({
                statusCode: 400,
                message: "Een verplicht veld ontbreekt"
            })
        } else if (!emailAdress.includes("@") || !emailAdress.includes(".")) {
            console.log("Emailadres is fout");
            res.status(400).json({message: "Email Adress is ongeldig"});
        } else if (password.length < 5) {
            console.log("Password te kort");
            res.status(400).json({message: "Wachtwoord is te kort"});
        } else {

        pool.getConnection((err, connection) => {
            if (err) {
            res.status(500).json({error: err})
            }
            if (connection) {
                connection.query(
                    'SELECT id, firstName, lastName, emailAdress, password FROM user WHERE emailAdress=?',
                    [emailAdress],
                    (err, rows, fields) => {
                        connection.release()
                        if (err) {
                            res.status(500).json({error: err})
                        }
                        if (rows.length == 0) {
                            res.status(404).json({error: "User niet gevonden"})
                        } else if (rows.length > 0) {
                            if (rows[0].password == password) {
                                
                                const payload = { userId: rows[0].id}

                                jwt.sign(payload,process.env.JWT_SECRET, {expiresIn: '7d'}, function (err,token) {
                                    if (err) console.log(err)
                                    if (token) {
                                        console.log(token)
                                        rows[0].token = token
                                        res.status(200).json({
                                            statusCode: 200,
                                            results: rows[0]
                                        })
                                    }
                                })

                            } else {res.status(400).json({Message: "Fout wachtwoord"})}
                        } else {
                            res.status(500).json({error: "Er is iets heel vreemd gegeaan"})
                        }
                    }
                )
            }
        })
    }
    }

};

module.exports = controller;