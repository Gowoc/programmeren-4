const mysql = require('mysql');
require("dotenv").config();

const pool = mysql.createPool({
    connectionLimit: 10,
    host: process.env.DB_HOST,
    post: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

module.exports = pool;

pool.on('acquire', (connection) => {
    console.log('connection %d acquired', connection.threadId)
})

pool.on('release', (connection) => {
    console.log('Connection %d released', connection.threadId)
})