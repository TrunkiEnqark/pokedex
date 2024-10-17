require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'db',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'start',
    database: process.env.DB_NAME || 'FeedBack',
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10,
    idleTimeout: 60000,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
});

const executeQuery = async (query, params = []) => {
    const [rows] = await pool.query(query, params);
    return rows;
};

const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('Connect databases successfully');
        connection.release();
        return true;
    } catch (error) {
        console.error('Connect databases false', error);
        return false;
    }
};

module.exports = { 
    pool,
    executeQuery,
    testConnection
};