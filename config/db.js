// // const mysql = require("mysql2/promise"); // Use the promise-based mysql2 library
// // const config = require("./databaseConfig"); // Import the database config

// // // Create a MySQL connection pool using the provided configuration
// // const pool = mysql.createPool({
// //   host: config.host,
// //   user: config.username,
// //   password: config.password,
// //   database: config.database,
// //   waitForConnections: true,
// //   connectionLimit: 10, // Limit the number of concurrent connections
// //   queueLimit: 0,
// // });

// // // Export the pool so it can be used in other files
// // module.exports = pool;

// const mysql = require("mysql2/promise"); // Use the promise-based mysql2 library

// // Create a MySQL connection pool with the database credentials directly
// const pool = mysql.createPool({
//   host: "instantussd.coonohzoplm6.us-west-1.rds.amazonaws.com", // Replace with your DB host
//   user: "EPDev", // Replace with your DB username
//   password: "Mothermother111666", // Replace with your DB password
//   database: "mother_merchants", // Replace with your DB name
//   waitForConnections: true,
//   connectionLimit: 50, // Limit the number of concurrent connections
//   queueLimit: 0,
//   connectTimeout: 20000,
// });

// // Export the pool so it can be used in other files
// module.exports = pool;

const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize({
  database: process.env.DB_NAME || 'nouella',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Vicky@2017',
  host: process.env.DB_HOST ||  'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  dialect: 'mysql',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5, // Reduced for 2GB RAM server
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: false,
    underscored: false,
    freezeTableName: true
  }
});

module.exports = sequelize;