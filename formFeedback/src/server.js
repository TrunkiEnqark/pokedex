require('dotenv').config()
const express = require('express')
const path = require('path')
const configViewEngine = require('./config/viewEngine')
const webRoutes = require('./config/routes/web')

const mysql = require('mysql2');
// Get the client
const app = express()//express      
const port = process.env.PORT || 8080
const hostname = process.env.HOST_NAME

//config template engine
configViewEngine(app)
//config static files
app.use(express.static(path.join(__dirname, 'public')))
//khai bao route
app.use('/',webRoutes) //chia API routes for easy deleted

// create the connection to database
const connection = mysql.createConnection({
  host: 'localhost',
  port:3306,
  user: 'root',
  password:'',
  database: 'FeedBack',
});

// execute will internally call prepare and query
connection.execute(
  'SELECT * FROM Users',
  function (err, results, fields) {
    console.log(">>> result = ",results); // results contains rows returned by server
    // console.log(fields); // fields contains extra meta data about results, if available
  }
);

app.listen(port, hostname, () => {
  console.log(`Example app listening on port ${port}`)
})
