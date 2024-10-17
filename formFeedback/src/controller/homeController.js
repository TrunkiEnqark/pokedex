require('dotenv').config();
const { pool, executeQuery } = require('../config/database');

const getFeedback= (req, res) => {
    res.render('index');
}


const getDataDisplay = async (req, res) => {
    try {
        const rows = await executeQuery('SELECT * FROM User');
        res.render('display-data', { users: rows });
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Error fetching data');
    }
}

module.exports = {
    getFeedback,
    getDataDisplay
}
