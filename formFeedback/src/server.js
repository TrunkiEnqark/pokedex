require('dotenv').config();
const express = require('express');
const path = require('path');
const configViewEngine = require('./config/viewEngine');
const webRoutes = require('./config/routes/web');
const mysql = require('mysql2');

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

// Create the connection to database
const connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '1',
  database: 'FeedBack',
});

// Connect to the database
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database: ' + err.stack);
    return;
  }
  console.log('Connected to database.');
});

// Route to handle form submission
app.post('/feedback', (req, res) => {
  const { firstname, lastname, email, feedback } = req.body;
  const sql = 'INSERT INTO User (Firstname, Lastname, Email, Content) VALUES (?, ?, ?, ?)';
  connection.query(sql, [firstname, lastname, email, feedback], (err, result) => {
    if (err) {
      console.error('Error inserting data: ' + err);
      res.status(500).json({ message: 'Error saving data' });
    } else {
      res.status(200).json({ message: 'Data inserted successfully', id: result.insertId });
    }
  });
});
// Use web routes
app.use('/', webRoutes);
// execute will internally call prepare and query
connection.execute(
  'SELECT * FROM User',
  function (err, results, fields) {
    console.log(">>> result = ",results); // results contains rows returned by server
    // console.log(fields); // fields contains extra meta data about results, if available
  }
);
app.listen(port,  () => {
  console.log(`listening on port http://${hostname}:${port}`);
})
