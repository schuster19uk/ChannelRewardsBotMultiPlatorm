const tmi = require('tmi.js');
const { addPointsToTwitchUser } = require('./database');

//rewards points
const rewardPoints = process.env["REWARD_POINTS"];

// Function to initialize the Twitch client
function initializeTwitchClient(oauthToken, channel, botUsername) {
  const twitchOptions = {
    options: { debug: true },
    connection: {
      reconnect: true,
    },
    identity: {
      username: botUsername,
      password: oauthToken,
    },
    channels: [channel],
  };

  // Create a Twitch client
  const twitchClient = new tmi.client(twitchOptions);

  // Register event handler for when the client connects
  twitchClient.on('connected', (address, port) => {
    console.log(`Connected to Twitch at ${address}:${port}`);
    // You can add any additional logic you want to execute when the client connects
  });

  // Register event handler for when the client encounters an error
  twitchClient.on('error', (err) => {
    console.error('Error:', err);
    // You can add any additional error-handling logic here
  });

  // Register event handler for chat messages
  twitchClient.on('message', (channel, userstate, message, self) => {
    // Ignore messages from the bot itself
    if (self) return;

    // Extract username , display-name , userId and chat Id (id) message from userstate
    const { username, ['display-name']: displayName, 'user-id': userId, 'id': messageId } = userstate;

    console.log(`[Twitch Message] ${message}`);

    // Check if the message contains a specific command (e.g., !addPoints)
    if (message.toLowerCase() === '!addpoints') {
      // Add 5 points to the user in the database
      addPointsToTwitchUser(username, rewardPoints , userId , messageId, displayName);
    }
  });

  // Register event handler for new users joining the Twitch chat
  twitchClient.on('join', (channel, username, self) => {
    if (self) return; // Ignore own join events
    console.log(`[Twitch] ${username} joined ${channel}`);
    // Add your logic here if needed
  });

  twitchClient.on('part', (channel, username) => {
    console.log(`[Twitch] ${username} left ${channel}`);
    //users.delete(username);
  });

  // Connect to Twitch chat
  twitchClient.connect();
}

// Export the initializeTwitchClient function
module.exports = {
  initializeTwitchClient,
};