// twitchBot.js

const tmi = require('tmi.js');

let client; // Declare the client variable outside the functions

function initializeBot(options) {
  // Set up the client with the provided options
  client = new tmi.Client(options);

  // Register event handlers
  client.on('message', (channel, userstate, message, self) => {
    // Handle incoming messages
    console.log(`${userstate.username}: ${message}`);
  });

  client.on('connected', (address, port) => {
    console.log(`Connected to ${address}:${port}`);
  });

  // Connect to Twitch
  client.connect();
}

// Export the initializeBot function
module.exports = {
  initializeBot,
};