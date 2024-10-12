require('dotenv').config();
const express = require('express');
const path = require('path');
const configViewEngine = require('./config/viewEngine');
const webRoutes = require('./config/routes/web');
const { pool, executeQuery, testConnection } = require('./config/database');

const app = express();
const port = process.env.PORT || 3001;
const hostname = process.env.HOST_NAME || 'localhost';

// Config template engine
configViewEngine(app);

// Config static files
app.use(express.static(path.join(__dirname, 'src/public')));

// Parse JSON bodies
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Route to handle form submission
app.post('/', async (req, res) => {
    console.log('Received feedback submission:', req.body);
    const {firstname,lastname,email,feedback} = req.body;
    const sql = `INSERT INTO User (firstname,lastname,email,feedback) VALUES (?,?,?,?)`;
    try {
        const result = await executeQuery(sql, [firstname, lastname, email, feedback]);
        console.log('Query result:', result);
        res.status(200).json({ message: 'Data inserted successfully', id: result.insertId });
    } catch (err) {
        console.error('Lỗi khi chèn dữ liệu:', err);
        res.status(500).json({ message: 'Error saving data', error: err.message });
    }
});
 
// Use web routes
app.use('/', webRoutes);

// Test database connection
(async () => {
  const isConnected = await testConnection();
  if (isConnected) {
    app.listen(port, () => {
      console.log(`Server running at http://${hostname}:${port}`);
    });
  } else {
    console.error('Unable to start server due to database connection failure');
    process.exit(1);
  }
})();
const waitForMySql = async () => {
  while (true) {
    try {
      await testConnection();
      console.log('MySQL ready');
      break;
    } catch (error) {
      console.log('Waiting MySQL start...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
};

(async () => {
  await waitForMySql();
  // Phần còn lại của mã khởi động server
})();
(async () => {
  try {
    const results = await executeQuery('SELECT * FROM User');
    console.log(">>> result = ", results);
  } catch (err) {
    console.error('Error querying database:', err);
  }
})();
