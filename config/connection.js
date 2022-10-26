//requires the sql package to connect sql 
const mysql = require('mysql2')
require('dotenv').config()

const db = mysql.createConnection({
  // user info for sql
  host: 'localhost',
  user: 'root',
  password: process.env.pass,
  database: 'all_employees_db'
})
//exports db 
module.exports = db