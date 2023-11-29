const mysql = require('mysql');

// Function to initialize the MySQL database connection
function initializeDatabase(host, database, username, password) {
  const dbConnection = mysql.createConnection({
    host: host,
    user: username,
    password: password,
    database: database,
  });

  // Connect to the MySQL database
  dbConnection.connect((err) => {
    if (err) {
      console.error('Error connecting to MySQL:', err);
      return;
    }
    console.log('Connected to MySQL database');

    // Create the users table if it doesn't exist
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        points INT DEFAULT 0
      )
    `;

    dbConnection.query(createTableQuery, (error, results) => {
      if (error) {
        console.error('Error creating users table:', error);
      } else {
        console.log('Users table created or already exists');
      }
    });
  });

  // Function to add points to a user in the database
  function addPointsToUser(username, pointsToAdd) {
    const query = 'UPDATE users SET points = points + ? WHERE username = ?';

    dbConnection.query(query, [pointsToAdd, username], (error, results) => {
      if (error) {
        console.error('Error updating points:', error);
        return;
      }
      console.log(`Points added to ${username}`);
    });
  }

  return {
    addPointsToUser,
  };
}

// Export the initializeDatabase function
module.exports = {
  initializeDatabase,
};