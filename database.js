// database.js
const mysql = require('mysql');

// MySQL Database Configuration
const dbConfig = {
  host: 'your_mysql_host',
  user: 'your_mysql_user',
  password: 'your_mysql_password',
  database: 'your_mysql_database',
};

// Create a MySQL connection pool
const pool = mysql.createPool(dbConfig);

// Function to create Twitch users table
function createTwitchUsersTable() {
  const connection = mysql.createConnection(dbConfig);
  connection.connect((err) => {
    if (err) {
      console.error('MySQL Connection Error:', err);
      process.exit(1);
    }

    const twitchUsersTableSQL = `
      CREATE TABLE IF NOT EXISTS twitch_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        points INT NOT NULL,
        UNIQUE KEY unique_username (username)
      )
    `;

    connection.query(twitchUsersTableSQL, (twitchErr) => {
      if (twitchErr) {
        console.error('Error creating Twitch users table:', twitchErr);
      } else {
        console.log('Twitch users table created successfully.');
      }

      connection.end();
    });
  });
}

// Function to update Twitch user points in the MySQL database
function getAndUpdateTwitchPointsFromDatabase(username, pointsToAdd) {
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('MySQL Connection Error:', err);
      return;
    }

    const selectQuery = `SELECT points FROM twitch_users WHERE username = ?`;
    const selectValues = [username];

    connection.query(selectQuery, selectValues, async (selectError, selectResults) => {
      if (selectError) {
        console.error('MySQL Query Error:', selectError);
        connection.release();
        return;
      }

      if (selectResults.length > 0) {
        const { points } = selectResults[0];
        const newPoints = points + pointsToAdd;

        const updateQuery = `UPDATE twitch_users SET points = ? WHERE username = ?`;
        const updateValues = [newPoints, username];

        connection.query(updateQuery, updateValues, (updateError, updateResults) => {
          if (updateError) {
            console.error('MySQL Query Error:', updateError);
          }
        });
      } else {
        // User not found, insert a new record
        const insertQuery = `INSERT INTO twitch_users (username, points) VALUES (?, ?)`;
        const insertValues = [username, pointsToAdd];

        connection.query(insertQuery, insertValues, (insertError, insertResults) => {
          if (insertError) {
            console.error('MySQL Query Error:', insertError);
          }
        });
      }

      connection.release();
    });
  });
}

// Function to create YouTube users table
function createYouTubeUsersTable() {
  const connection = mysql.createConnection(dbConfig);
  connection.connect((err) => {
    if (err) {
      console.error('MySQL Connection Error:', err);
      process.exit(1);
    }

    const youtubeUsersTableSQL = `
      CREATE TABLE IF NOT EXISTS youtube_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        points INT NOT NULL,
        UNIQUE KEY unique_username (username)
      )
    `;

    connection.query(youtubeUsersTableSQL, (youtubeErr) => {
      if (youtubeErr) {
        console.error('Error creating YouTube users table:', youtubeErr);
      } else {
        console.log('YouTube users table created successfully.');
      }

      connection.end();
    });
  });
}

// Function to update YouTube user points in the MySQL database
function getAndUpdateYouTubePointsFromDatabase(username, pointsToAdd) {
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('MySQL Connection Error:', err);
      return;
    }

    const selectQuery = `SELECT points FROM youtube_users WHERE username = ?`;
    const selectValues = [username];

    connection.query(selectQuery, selectValues, async (selectError, selectResults) => {
      if (selectError) {
        console.error('MySQL Query Error:', selectError);
        connection.release();
        return;
      }

      if (selectResults.length > 0) {
        const { points } = selectResults[0];
        const newPoints = points + pointsToAdd;

        const updateQuery = `UPDATE youtube_users SET points = ? WHERE username = ?`;
        const updateValues = [newPoints, username];

        connection.query(updateQuery, updateValues, (updateError, updateResults) => {
          if (updateError) {
            console.error('MySQL Query Error:', updateError);
          }
        });
      } else {
        // User not found, insert a new record
        const insertQuery = `INSERT INTO youtube_users (username, points) VALUES (?, ?)`;
        const insertValues = [username, pointsToAdd];

        connection.query(insertQuery, insertValues, (insertError, insertResults) => {
          if (insertError) {
            console.error('MySQL Query Error:', insertError);
          }
        });
      }

      connection.release();
    });
  });
}

module.exports = {
  createTwitchUsersTable,
  getAndUpdateTwitchPointsFromDatabase,
  createYouTubeUsersTable,
  getAndUpdateYouTubePointsFromDatabase,
};