//created for mysql 
//(works but went with dynamoDB in AWS to host in the cloud using free tier)
//"mysql2": "^3.6.5", for package json
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
                user_id INT PRIMARY KEY,
                username VARCHAR(255) NOT NULL,
                display_name VARCHAR(255) NOT NULL,
                message_id string DEFAULT 0,
                points INT DEFAULT 0
              );
              CREATE TABLE IF NOT EXISTS youtube_users (
                user_id INT PRIMARY KEY,
                username VARCHAR(255) NOT NULL,
                display_name VARCHAR(255) NOT NULL,
                message_id string DEFAULT 0,
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

function addPointsToTwitchUser(username, pointsToAdd ,  userId , messageId, displayName ) {

  const select = 'SELECT username from twitch_users WHERE username = ?';

  dbConnection.query(select, [username], (error, results) => {
    if (error) {
      console.error('error getting user:', error);
      return;
    }else{
      if(results.length > 0)
      {
          const query = 'UPDATE twitch_users SET points = points + ? , message_id = ? , display_name = ?  WHERE user_id = ?';

          dbConnection.query(query, [pointsToAdd, userId , messageId , displayName], (error, results) => {
            if (error) {
              console.error('Error updating points:', error);
              return;
            }
            else {
              console.log(`updated points for user ( ${username} )`);
            }

          });
      }else {

        const query = 'INSERT INTO twitch_users (user_id , username , display_name , message_id, points) values (?,  ? , ? , ? , ?)';

        dbConnection.query(query, [ userId, username,  displayName, messageId, pointsToAdd], (error, results) => {
          if (error) {
            console.error('user created with initial points:', error);
            return;
          }

          if (results.affectedRows > 0)
          {
            console.log(`${username} created and points added (new user) with ID: ` + results.insertId);
          }

        });
      }
    }
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