const mysql = require('mysql2');
require("dotenv").config();

const dbConfig = {
    connectionLimit: 10,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
}

const pool = mysql.createPool(dbConfig);

pool.on('acquire', (connection) => {
    console.log('connection %d acquired', connection.threadId)
})

pool.on('release', (connection) => {
    console.log('Connection %d released', connection.threadId)
})

module.exports = pool;