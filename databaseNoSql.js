// created for mongo in case we decide to use this
const { MongoClient } = require('mongodb');

let db;

async function initializeDatabase(url, database) {
  const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    db = client.db(database);
    console.log(`Connected to database: ${database}`);
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
  }
}

async function closeDatabaseConnection() {
  if (db) {
    await db.close();
    console.log('MongoDB connection closed');
  }
}

async function addPointsToTwitchUser(username, pointsToAdd, userId, messageId, displayName) {
  const twitchUsersCollection = db.collection('twitch_users');

  try {
    const existingUser = await twitchUsersCollection.findOne({ username: username });

    if (existingUser) {
      // User exists, update points
      await twitchUsersCollection.updateOne(
        { username: username },
        {
          $set: {
            points: existingUser.points + pointsToAdd,
            message_id: messageId,
            display_name: displayName,
          },
        }
      );
      console.log(`Updated points for user (${username})`);
    } else {
      // User doesn't exist, insert new user
      await twitchUsersCollection.insertOne({
        user_id: userId,
        username: username,
        display_name: displayName,
        message_id: messageId,
        points: pointsToAdd,
      });
      console.log(`${username} created and points added (new user)`);
    }
  } catch (err) {
    console.error('Error adding points to Twitch user:', err);
  }
}

async function addPointsToYoutubeUser(username, pointsToAdd) {
  const youtubeUsersCollection = db.collection('youtube_users');

  try {
    // Update points for the specified YouTube user
    await youtubeUsersCollection.updateOne(
      { username: username },
      {
        $inc: { points: pointsToAdd },
      }
    );
    console.log(`Points added to ${username}`);
  } catch (err) {
    console.error('Error adding points to YouTube user:', err);
  }
}

module.exports = {
  initializeDatabase,
  closeDatabaseConnection,
  addPointsToTwitchUser,
  addPointsToYoutubeUser,
};