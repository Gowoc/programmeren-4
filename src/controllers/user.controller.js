const pool = require("../database/dbconnection")

function getUserMeals(userId, callback) {
    pool.getConnection((err, connection) => {
        if (err) {
        res.status(500).json({error: err})
        }
        if (connection) {
            connection.query(
                'SELECT * FROM meal WHERE meal.id IN(SELECT mealId FROM meal_participants_user WHERE meal_participants_user.userId = ?)',
                [userId],
                (err, rows, fields) => {
                    connection.release()
                    if (err) {
                        callback(err, undefined)
                    }
                    if (rows.length == 0) {
                        const error = "Geen meals"
                        callback(error, undefined)
                    } else if (rows.length > 0) {
                        callback(undefined, rows)
                    } else {
                        const error = "Zeer vreemde fout"
                        callback(error, undefined)
                    }
                }
            )
        }
    })
}

let controller = {
    allUsers(req,res) {
        let limit = 999
        let name = "%"
        if (req.query.limit) {
            limit = Number(req.query.limit)
            
        }
        if (req.query.name) {
            name = req.query.name
            name +="%"
        }
        if (req.query.active) {
            let active = req.query.active;
            pool.getConnection((err, connection) => {
                if (err) {
                res.status(500).json({error: err})
                }
                if (connection) {
                    connection.query(
                        'SELECT * FROM `user` WHERE user.firstName LIKE ? AND user.isActive = ? LIMIT ?',
                        [name,active,limit],
                        (err, rows, fields) => {
                            connection.release()
                            if (err) {
                                res.status(500).json({error: err})
                            }
                            if (rows.length == 0) {
                                res.status(200).json({error: "Geen users matchen de zoekopdracht"})
                            } else if (rows.length > 0) {
                                res.status(200).json(rows)
                            } else {
                                res.status(500).json({error: "Er is iets heel vreemd gegeaan"})
                            }
                        }
                    )
                }
            })
        } 
        if (!req.query.active) {
            pool.getConnection((err, connection) => {
                if (err) {
                res.status(500).json({error: err})
                }
                if (connection) {
                    connection.query(
                        'SELECT * FROM `user` WHERE user.firstName LIKE ? LIMIT ?',
                        [name,limit],
                        (err, rows, fields) => {
                            connection.release()
                            if (err) {
                                res.status(500).json({error: err})
                            }
                            if (rows.length == 0) {
                                res.status(200).json({error: "Geen users matchen de zoekopdracht"})
                            } else if (rows.length > 0) {
                                res.status(200).json(rows)
                            } else {
                                res.status(500).json({error: "Er is iets heel vreemd gegeaan"})
                            }
                        }
                    )
                }
            })
        }

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
            res.status(500).json({error: err})
            }
            if (connection) {
                connection.query(
                    'SELECT `firstname` FROM `user` WHERE `emailAdress` = ?',
                    [req.body.emailAdress],
                    (err, rows, fields) => {
                        connection.release()
                        if (err) {
                            res.status(500).json({error: err})
                        }
                        if (rows.length > 0) {
                            console.log(rows)
                            res.status(409).json({message: "Gebruiker bestaat al"});
                        } else {
                            pool.getConnection((err, connection) => {
                                if (err) {
                                res.status(500).json({error: err})
                                }
                                if (connection) {
                                    connection.query(
                                        'INSERT INTO `user` (`firstName`,`lastName`,`emailAdress`,`password`,`street`,`city`) VALUES (?,?,?,?,?,?) ',
                                        [req.body.firstName,req.body.lastName,req.body.emailAdress,req.body.password,req.body.street,req.body.city],
                                        (err, rows, fields) => {
                                            connection.release()
                                            if (err) {
                                                res.status(500).json({error: err})
                                            }
                                            else {
                                                pool.getConnection((err, connection) => {
                                                    if (err) {
                                                    res.status(500).json({error: err})
                                                    }
                                                    if (connection) {
                                                        connection.query(
                                                            'SELECT * FROM `user` WHERE `emailAdress` = ?',
                                                            [req.body.emailAdress],
                                                            (err, rows, fields) => {
                                                                connection.release()
                                                                if (err) {
                                                                    res.status(500).json({error: err})
                                                                }
                                                                if (rows.length > 0) {
                                                                    res.status(201).json(rows)
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
            res.status(500).json({error: err})
            }
            if (connection) {
                connection.query(
                    'SELECT * FROM `user` WHERE `id` = ?',
                    [userId],
                    (err, rows, fields) => {
                        connection.release()
                        if (err) {
                            res.status(500).json({error: err})
                        }
                        if (rows.length == 0) {
                            res.status(404).json({error: "User bestaat niet"})
                        } else if (rows.length > 0) {
                            getUserMeals(userId, (error, result) => {
                                if (error == "Geen meals") {
                                    res.status(200).json(rows);
                                } else if (error) {
                                    res.status(500).json({error: error})
                                }
                                if (result) {
                                    rows[0].meals = result
                                    res.status(200).json(rows);
                                }
                            })
                        } else {
                            res.status(500).json({error: "Er is iets heel vreemd gegeaan"})
                        }
                    }
                )
            }
        })
    },

    userProfile(req,res) {
        const userId = req.userIdFromToken;
        pool.getConnection((err, connection) => {
            if (err) {
            res.status(500).json({error: err})
            }
            if (connection) {
                connection.query(
                    'SELECT * FROM `user` WHERE `id` = ?',
                    [userId],
                    (err, rows, fields) => {
                        connection.release()
                        if (err) {
                            res.status(500).json({error: err})
                        }
                        if (rows.length == 0) {
                            res.status(404).json({error: "User bestaat niet"})
                        } else if (rows.length > 0) {
                            getUserMeals(userId, (error, result) => {
                                if (error == "Geen meals") {
                                    res.status(200).json(rows);
                                } else if (error) {
                                    res.status(500).json({error: error})
                                }
                                if (result) {
                                    rows[0].meals = result
                                    res.status(200).json(rows);
                                }
                            })
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
        const loggedUserId = req.userIdFromToken;
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
            res.status(500).json({error: err})
            }
            if (connection) {
                connection.query(
                    'SELECT `id` FROM `user` WHERE `id` = ?',
                    [userId],
                    (err, rows, fields) => {
                        connection.release()
                        if (err) {
                            res.status(500).json({error: err})
                        }
                        if (rows.length == 0) {
                            console.log(rows)
                            res.status(400).json({message: "Gebruiker bestaat niet"});
                        } else {
                            if (userId == loggedUserId) {
                            pool.getConnection((err, connection) => {
                                if (err) {
                                res.status(500).json({error: err})
                                }
                                if (connection) {
                                    connection.query(
                                        'UPDATE `user` SET `firstName` = ?, `lastName` = ?, `isActive` = ?, `emailAdress` = ?, `password` = ?, `phoneNumber` = ?, `roles` = ?, `street` = ?, `city` = ? WHERE `id` = ?;',
                                        [req.body.firstName,req.body.lastName,req.body.isActive,req.body.emailAdress,req.body.password,req.body.phoneNumber,req.body.roles,req.body.street,req.body.city,userId],
                                        (err, rows, fields) => {
                                            connection.release()
                                            if (err) {
                                                res.status(500).json({error: err})
                                            }
                                            else {
                                                pool.getConnection((err, connection) => {
                                                    if (err) {
                                                    res.status(500).json({error: err})
                                                    }
                                                    if (connection) {
                                                        connection.query(
                                                            'SELECT * FROM `user` WHERE `id` = ?',
                                                            [userId],
                                                            (err, rows, fields) => {
                                                                connection.release()
                                                                if (err) {
                                                                    res.status(500).json({error: err})
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
                            } else {res.status(403).json({message: "Gebruiker is niet de eigenaar"})}
                        }
                    }
                )
            }
        })
    },

    deleteUser(req,res) {
        let userId = req.params.userId;
        const loggedUserId = req.userIdFromToken;

        pool.getConnection((err, connection) => {
            if (err) {
            res.status(500).json({error: err})
            }
            if (connection) {
                connection.query(
                    'SELECT `id` FROM `user` WHERE `id` = ?',
                    [userId],
                    (err, rows, fields) => {
                        connection.release()
                        if (err) {
                            res.status(500).json({error: err})
                        }
                        if (rows.length == 0) {
                            console.log(rows)
                            res.status(400).json({message: "Gebruiker bestaat niet"});
                        } else {
                            if (userId == loggedUserId) {
                            pool.getConnection((err, connection) => {
                                if (err) {
                                res.status(500).json({error: err})
                                }
                                if (connection) {
                                    connection.query(
                                        'DELETE FROM `user` WHERE `id` = ?',
                                        [userId],
                                        (err, rows, fields) => {
                                            connection.release()
                                            if (err) {
                                                res.status(500).json({error: err})
                                            }
                                            else {
                                                res.status(200).json({message: "Gebruiker verwijdert"})
                                            }
                                        }
                                    )
                                }
                            })
                            } else {res.status(403).json({message: "Gebruiker is niet de eigenaar"})}
                        }
                    }
                )
            }
        })
    }
};

module.exports = controller;