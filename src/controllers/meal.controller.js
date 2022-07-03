const pool = require("../database/dbconnection")

function arrayForEach(array, callback) {
    let returnString = ""
    array.forEach(item => {
        returnString += item += " ";
    })
    callback(returnString)
}

let controller = {
    allMeals(req,res) {
        pool.getConnection((err, connection) => {
            if (err) {
            res.status(500).json({error: err})
            }
            if (connection) {
                connection.query(
                    'SELECT * FROM `meal`',
                    [],
                    (err, rows, fields) => {
                        connection.release()
                        if (err) {
                            res.status(500).json({error: err})
                        }
                        if (rows.length == 0) {
                            res.status(404).json({error: "Er zijn geen meals"})
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

    newMeal(req,res) {
        let newMeal = req.body;
        let CookId = req.userIdFromToken;
        arrayForEach(newMeal.allergenes, (callback) => {

        if (newMeal.dateTime == null || newMeal.price == null || newMeal.imageUrl == null || newMeal.name == null || newMeal.description == null) {
            res.status(400).json({message: "Verplicht veld ontbreekt"});
        } else {
            pool.getConnection((err, connection) => {
                if (err) {
                    console.log(err)
                    res.status(500).json({error: err})
                }
                if (connection) {
                    connection.query(
                        'INSERT INTO `meal` (`name`,`description`,`isActive`,`isVega`,`isVegan`,`isToTakeHome`,`dateTime`,`imageUrl`,`allergenes`,`maxAmountOfParticipants`,`price`,`cookId`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?) ',
                        [newMeal.name,newMeal.description,newMeal.isActive,newMeal.isVega,newMeal.isVegan,newMeal.isToTakeHome,newMeal.dateTime,newMeal.imageUrl,callback,newMeal.maxAmountOfParticipants,newMeal.price,CookId],
                        (err, rows, fields) => {
                            connection.release()
                            if (err) {
                                console.log(err)
                                res.status(500).json({error: err})
                            }
                            else {
                                pool.getConnection((err, connection) => {
                                    if (err) {
                                        console.log(err)
                                        res.status(500).json({error: err})
                                    }
                                    if (connection) {
                                        connection.query(
                                            'SELECT `id` FROM `meal` ORDER BY `id` DESC limit 1',
                                            [],
                                            (err, rows, fields) => {
                                                connection.release()
                                                if (err) {
                                                    console.log(err)
                                                    res.status(500).json({error: err})
                                                }
                                                if (rows.length > 0) {
                                                    console.log(rows[0]);
                                                    pool.getConnection((err, connection) => {
                                                        if (err) {
                                                            console.log(err)
                                                            res.status(500).json({error: err})
                                                        }
                                                        if (connection) {
                                                            connection.query(
                                                                'SELECT * FROM `meal` WHERE `id` = ?',
                                                                [rows[0].id],
                                                                (err, rows, fields) => {
                                                                    connection.release()
                                                                    if (err) {
                                                                        console.log(err)
                                                                        res.status(500).json({error: err})
                                                                    }
                                                                    if (rows.length > 0) {
                                                                        res.status(200).json(rows);
                                                                    } else {
                                                                        console.log("Heel vreemd")
                                                                        res.status(500).json({error: "Er is iets heel vreemd gegeaan"})
                                                                    }
                                                                }
                                                            )
                                                        }
                                                    })
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
    }) 
    },

    mealByID(req,res) {
        const mealId = req.params.mealId;
        pool.getConnection((err, connection) => {
            if (err) {
            res.status(500).json({error: err})
            }
            if (connection) {
                connection.query(
                    'SELECT * FROM `meal` WHERE `id` = ?',
                    [mealId],
                    (err, rows, fields) => {
                        connection.release()
                        if (err) {
                            res.status(500).json({error: err})
                        }
                        if (rows.length == 0) {
                            res.status(404).json({error: "meal bestaat niet"})
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

    deleteMeal(req,res) {
        const mealId = req.params.mealId;
        const userId = req.userIdFromToken;
        pool.getConnection((err, connection) => {
            if (err) {
            res.status(500).json({error: err})
            }
            if (connection) {
                connection.query(
                    'SELECT `id`, `cookId` FROM `meal` WHERE `id` = ?',
                    [mealId],
                    (err, rows, fields) => {
                        connection.release()
                        if (err) {
                            res.status(500).json({error: err})
                        }
                        if (rows.length == 0) {
                            console.log(rows)
                            res.status(404).json({message: "Meal bestaat niet"});
                        } else {
                            if (rows[0].cookId == userId) {
                            pool.getConnection((err, connection) => {
                                if (err) {
                                res.status(500).json({error: err})
                                }
                                if (connection) {
                                    connection.query(
                                        'DELETE FROM `meal` WHERE `id` = ?',
                                        [mealId],
                                        (err, rows, fields) => {
                                            connection.release()
                                            if (err) {
                                                res.status(500).json({error: err})
                                            }
                                            else {
                                                res.status(200).json({message: "Meal verwijdert"})
                                            }
                                        }
                                    )
                                }
                            })
                            }
                            else {
                                res.status(403).json({message: "Gebruiker is niet de eigenaar"})
                            }
                        }
                    }
                )
            }
        })
    }
};

module.exports = controller;