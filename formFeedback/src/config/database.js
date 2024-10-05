require('dotenv').config();
const mysql = require('mysql2/promise');
//Creating a sql pool running help not overflow data.
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10, //default  syntax
    idleTimeout: 60000, //default  syntax
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
});

const executeQuery = async (query, params = []) => {
    const [rows] = await pool.query(query, params);
    return rows;
};

module.exports = {
    pool,
    executeQuery
};
