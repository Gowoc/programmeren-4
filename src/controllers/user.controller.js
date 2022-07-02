const pool = require("../database/dbconnection")

function getAllUsers() {
    let users
    pool.getConnection(function(err,connection) {
        if (err) throw err
    
        connection.query('SELECT * FROM user;', (error, results, fields) => {
            connection.release();
            if (error) throw error;
            users = results;
          });
    });
    return users;
}


let controller = {
    allUsers(req,res) {
        //console.log("alsjeblieft");
        //res.status(200).json({users});

        pool.getConnection(function(err,connection) {
            if (err) throw err
        
            connection.query('SELECT * FROM user;', (error, results, fields) => {
                connection.release();
                if (error) throw error;
                console.log('The solution is: ', results);

                res.status(200).json({
                    statusCode: 200,
                    results: results
                });
              });
        });

    },

    newUser(req,res) {
        let newUser = req.body;
        let password = req.body.password;

        console.log(newUser);
        if (newUser.firstName == null || newUser.lastName == null || newUser.street == null || newUser.city == null || newUser.emailAdress == null || newUser.password == null) {
            console.log("Veld ontbreekt");
            res.status(400).json({message: "Verplicht veld ontbreekt"});
        } else if (password.length < 5) {
            console.log("Password te kort");
            res.status(400).json({message: "Wachtwoord is te kort"});
        } else if (!newUser.emailAdress.includes("@") || !newUser.emailAdress.includes(".")) {
            console.log("Emailadres is fout");
            res.status(400).json({message: "Email Adress is fout"});
        } else pool.getConnection((err, connection) => {
            if (err) {
            res.status(500).json({error: err.tostring()})
            }
            if (connection) {
                connection.query(
                    'SELECT `firstname` FROM `user` WHERE `emailAdress` = ?',
                    [req.body.emailAdress],
                    (err, rows, fields) => {
                        connection.release()
                        if (err) {
                            res.status(500).json({error: err.tostring()})
                        }
                        if (rows.length > 0) {
                            console.log(rows)
                            res.status(409).json({message: "Gebruiker bestaat al"});
                        } else {
                            pool.getConnection((err, connection) => {
                                if (err) {
                                res.status(500).json({error: err.tostring()})
                                }
                                if (connection) {
                                    connection.query(
                                        'INSERT INTO `user` (`firstName`,`lastName`,`emailAdress`,`password`,`street`,`city`) VALUES (?,?,?,?,?,?) ',
                                        [req.body.firstName,req.body.lastName,req.body.emailAdress,req.body.password,req.body.street,req.body.city],
                                        (err, rows, fields) => {
                                            connection.release()
                                            if (err) {
                                                res.status(500).json({error: err.tostring()})
                                            }
                                            else {
                                                pool.getConnection((err, connection) => {
                                                    if (err) {
                                                    res.status(500).json({error: err.tostring()})
                                                    }
                                                    if (connection) {
                                                        connection.query(
                                                            'SELECT * FROM `user` WHERE `emailAdress` = ?',
                                                            [req.body.emailAdress],
                                                            (err, rows, fields) => {
                                                                connection.release()
                                                                if (err) {
                                                                    res.status(500).json({error: err.tostring()})
                                                                }
                                                                if (rows.length > 0) {
                                                                    res.status(200).json(rows)
                                                                } else {
                                                                    res.status(500).json({error: "Er is iets heel vreemd gegeaan"})
                                                                }
                                                            }
                                                        )
                                                    }
                                                })
                                            }
                                        }
                                    )
                                }
                            })
                        }
                    }
                )
            }
        })
    },

    userByID(req,res) {
        const userId = req.params.userId;
        pool.getConnection((err, connection) => {
            if (err) {
            res.status(500).json({error: err.tostring()})
            }
            if (connection) {
                connection.query(
                    'SELECT * FROM `user` WHERE `id` = ?',
                    [userId],
                    (err, rows, fields) => {
                        connection.release()
                        if (err) {
                            res.status(500).json({error: err.tostring()})
                        }
                        if (rows.length == 0) {
                            res.status(404).json({error: "User bestaat niet"})
                        } else if (rows.length > 0) {
                            res.status(200).json(rows)
                        } else {
                            res.status(500).json({error: "Er is iets heel vreemd gegeaan"})
                        }
                    }
                )
            }
        })
    },

    editUser(req,res) {
        newUser = req.body;
        const userId = req.params.userId;

        console.log(newUser);
        if (newUser.firstName == null || newUser.lastName == null || newUser.street == null || newUser.city == null || newUser.emailAdress == null || newUser.password == null) {
            res.status(400).json({message: "Verplicht veld ontbreekt"});
        } else if (req.body.password.length < 5) {
            console.log("Password te kort");
            res.status(400).json({message: "Wachtwoord is te kort"});
        } else if (req.body.phoneNumber.length < 11 && !(req.body.phoneNumber == "-")) {
            console.log("Telefoon nummer klopt niet");
            console.log(req.body.phoneNumber)
            res.status(400).json({message: "Telefoon Nummer is fout"});
        } else if (!newUser.emailAdress.includes("@") || !newUser.emailAdress.includes(".")) {
            console.log("Emailadres is fout");
            res.status(400).json({message: "Email Adress is fout"});
        } else pool.getConnection((err, connection) => {
            if (err) {
            res.status(500).json({error: err.tostring()})
            }
            if (connection) {
                connection.query(
                    'SELECT `id` FROM `user` WHERE `id` = ?',
                    [userId],
                    (err, rows, fields) => {
                        connection.release()
                        if (err) {
                            res.status(500).json({error: err.tostring()})
                        }
                        if (rows.length == 0) {
                            console.log(rows)
                            res.status(409).json({message: "Gebruiker bestaat niet"});
                        } else {
                            pool.getConnection((err, connection) => {
                                if (err) {
                                res.status(500).json({error: err.tostring()})
                                }
                                if (connection) {
                                    connection.query(
                                        'UPDATE `user` SET `firstName` = ?, `lastName` = ?, `isActive` = ?, `emailAdress` = ?, `password` = ?, `phoneNumber` = ?, `roles` = ?, `street` = ?, `city` = ? WHERE `id` = ?;',
                                        [req.body.firstName,req.body.lastName,req.body.isActive,req.body.emailAdress,req.body.password,req.body.phoneNumber,req.body.roles,req.body.street,req.body.city,userId],
                                        (err, rows, fields) => {
                                            connection.release()
                                            if (err) {
                                                res.status(500).json({error: err.tostring()})
                                            }
                                            else {
                                                pool.getConnection((err, connection) => {
                                                    if (err) {
                                                    res.status(500).json({error: err.tostring()})
                                                    }
                                                    if (connection) {
                                                        connection.query(
                                                            'SELECT * FROM `user` WHERE `id` = ?',
                                                            [userId],
                                                            (err, rows, fields) => {
                                                                connection.release()
                                                                if (err) {
                                                                    res.status(500).json({error: err.tostring()})
                                                                }
                                                                if (rows.length > 0) {
                                                                    res.status(200).json(rows)
                                                                } else {
                                                                    res.status(500).json({error: "Er is iets heel vreemd gegeaan"})
                                                                }
                                                            }
                                                        )
                                                    }
                                                })
                                            }
                                        }
                                    )
                                }
                            })
                        }
                    }
                )
            }
        })
    },

    deleteUser(req,res) {
        let userId = req.params.userId;
        pool.getConnection((err, connection) => {
            if (err) {
            res.status(500).json({error: err.tostring()})
            }
            if (connection) {
                connection.query(
                    'SELECT `id` FROM `user` WHERE `id` = ?',
                    [userId],
                    (err, rows, fields) => {
                        connection.release()
                        if (err) {
                            res.status(500).json({error: err.tostring()})
                        }
                        if (rows.length == 0) {
                            console.log(rows)
                            res.status(409).json({message: "Gebruiker bestaat niet"});
                        } else {
                            pool.getConnection((err, connection) => {
                                if (err) {
                                res.status(500).json({error: err.tostring()})
                                }
                                if (connection) {
                                    connection.query(
                                        'DELETE FROM `user` WHERE `id` = ?',
                                        [userId],
                                        (err, rows, fields) => {
                                            connection.release()
                                            if (err) {
                                                res.status(500).json({error: err.tostring()})
                                            }
                                            else {
                                                res.status(200).json({message: "Gebruiker verwijdert"})
                                            }
                                        }
                                    )
                                }
                            })
                        }
                    }
                )
            }
        })
    }
};

module.exports = controller;