const tmi = require('tmi.js');
//const { addPointsToUser } = require('./database');

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

    // Extract username and message from userstate
    const { username } = userstate;

    // Check if the message contains a specific command (e.g., !addPoints)
    if (message.toLowerCase() === '!addpoints') {
      // Add 5 points to the user in the database
      //addPointsToUser(username, 5);
    }
  });

  // Connect to Twitch chat
  twitchClient.connect();
}

// Export the initializeTwitchClient function
module.exports = {
  initializeTwitchClient,
};