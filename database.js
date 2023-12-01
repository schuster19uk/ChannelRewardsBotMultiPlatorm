const mysql = require('mysql2');

let dbConnection;

function initializeDatabase(host, database, username, password) {
  const connectionConfig = {
    host: host,
    user: username,
    password: password,
    multipleStatements: true,
  };

  dbConnection = mysql.createConnection(connectionConfig);

  dbConnection.connect((err) => {
    if (err) {
      console.error('Error connecting to MySQL:', err);
      return;
    }

    console.log('Connected to MySQL');

    dbConnection.query(`CREATE DATABASE IF NOT EXISTS ${database}`, (createDbError) => {
      if (createDbError) {
        console.error('Error creating database:', createDbError);
      } else {
        console.log(`Database '${database}' created or already exists`);
        connectionConfig.database = database;
        dbConnection.changeUser(connectionConfig, (changeUserError) => {
          if (changeUserError) {
            console.error('Error changing to database:', changeUserError);
          } else {
            console.log(`Switched to database '${database}'`);

            const createTablesQuery = `
              CREATE TABLE IF NOT EXISTS twitch_users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) NOT NULL,
                message_id INT DEFAULT 0,
                points INT DEFAULT 0
              );
              CREATE TABLE IF NOT EXISTS youtube_users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) NOT NULL,
                message_id INT DEFAULT 0,
                points INT DEFAULT 0
              );
            `;

            dbConnection.query(createTablesQuery, (createTablesError) => {
              if (createTablesError) {
                console.error('Error creating tables:', createTablesError);
              } else {
                console.log('Tables created or already exist');
              }
            });
          }
        });
      }
    });
  });
}

function addPointsToTwitchUser(username, pointsToAdd) {

  const query = 'UPDATE twitch_users SET points = points + ? WHERE username = ?';

  dbConnection.query(query, [pointsToAdd, username], (error, results) => {
    if (error) {
      console.error('Error updating points:', error);
      return;
    }
    console.log(`Points added to ${username}`);
  });
}

function addPointsToYoutubeUser(username, pointsToAdd) {
  const query = 'UPDATE youtube_users SET points = points + ? WHERE username = ?';

  dbConnection.query(query, [pointsToAdd, username], (error, results) => {
    if (error) {
      console.error('Error updating points:', error);
      return;
    }
    console.log(`Points added to ${username}`);
  });
}

module.exports = {
  initializeDatabase,
  addPointsToTwitchUser,
  addPointsToYoutubeUser,
};