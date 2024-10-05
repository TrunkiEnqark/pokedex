require('dotenv').config();
const express = require('express');
const path = require('path');
const configViewEngine = require('./config/viewEngine');
const webRoutes = require('./config/routes/web');
const { pool, executeQuery } = require('./config/database');

const app = express();
const port = process.env.PORT || 8080;
const hostname = process.env.HOST_NAME;

// Config template engine
configViewEngine(app);

// Config static files
app.use(express.static(path.join(__dirname, 'public')));

// Parse JSON bodies
app.use(express.json());
// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Route to handle form submission
app.post('/feedback', async (req, res) => {
  const { firstname, lastname, email, feedback } = req.body;
  const sql = 'INSERT INTO User (Firstname, Lastname, Email, Content) VALUES (?, ?, ?, ?)';
  try {
    const result = await executeQuery(sql, [firstname, lastname, email, feedback]);
    res.status(200).json({ message: 'Data inserted successfully', id: result.insertId });
  } catch (err) {
    console.error('Error inserting data: ' + err);
    res.status(500).json({ message: 'Error saving data' });
  }
});

// Use web routes
app.use('/', webRoutes);

// Test database connection
(async () => {
  try {
    const results = await executeQuery('SELECT * FROM User');
    console.log(">>> result = ", results);
  } catch (err) {
    console.error('Error querying database:', err);
  }
})();

app.listen(port, () => {
  console.log(`Server running at http://${hostname}:${port}`);
});
