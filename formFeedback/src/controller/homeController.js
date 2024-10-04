const mysql = require('mysql2');

const getHomepage = (req, res) => {
  res.render('index');
}

const getFeedback = (req, res) => {
  res.render('index');
}

const getDataDisplay = async (req, res) => {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '1',
      database: 'FeedBack'
    });

    const [rows] = await connection.execute('SELECT * FROM User');
    
    res.render('display-data', { users: rows });
    
    await connection.end();
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Error fetching data');
  }
}

module.exports = {
  getHomepage,
  getFeedback,
  getDataDisplay
}
