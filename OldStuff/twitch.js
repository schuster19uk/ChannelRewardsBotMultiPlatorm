const axios = require('axios');
const twitchAuth = require('./twitchAuth');
// twitch.js
const tmi = require('tmi.js');
//const databaseModule = require('./database');

let twitchClient;
const users = new Set();

// Twitch Bot Configuration
// schubot client id is t7kyrxjq326tij087ax7o8a6y686d8
let twitchOpts = {
  identity: {
    username: 'schusterUK', // bot username
    password: 'your_twitch_oauth_token', // password / oauth token
  },
  channels: [process.env['TWITCH_CHANNELS']], //channels
};

const getTokenFunction = async () => {
  try {
    await twitchAuth.getToken();
    // Other asynchronous code or processing
  } catch (error) {
    console.error('Error:', error.message);
  }
};

getTokenFunction().then(result => {
  // Continue with the rest of your code that depends on the result
  let twitchOption = twitchAuth.getOptions

  twitchOption.identity.password = 'oauth:7jin3sjnphoj9i5u0fob3dle7mc2dx'

// Create Twitch client
 twitchClient = new tmi.Client(twitchOption);

// Set to store the list of users



// Register event handlers
twitchClient.on('message', (channel, userstate, message, self) => {
  console.log(`${userstate.username}: ${message}`);
});

twitchClient.on('connected', (address, port) => {
  console.log(`Connected to ${address}:${port}`);
});

twitchClient.on('disconnected', (reason) => {
  console.log(`Disconnected from Twitch. Reason: ${reason}`);
});

twitchClient.on('reconnect', () => {
  console.log('Reconnecting to Twitch...');
});
// Connect to Twitch

 
twitchClient.connect();


// // Connect to Twitch
// twitchClient.connect();

// // Function to create Twitch users table
// //databaseModule.createTwitchUsersTable();

// // Event handler for initial user list when connected
// twitchClient.on('connected', async (address, port) => {
//   console.log(`Bot connected to ${address}:${port}`);

//   // Get the initial list of users in the channel
//   const channel = twitchOption.channels[0]; // Assuming you are monitoring the first channel in the list
//   const initialUsers = await twitchClient.getChannels();//[0]?.state?.users;
  
//   initialUsers.forEach((user) => {
//     users.add(user.username);
//   });

//   console.log('Initial Users in Twitch chat:', Array.from(users));
// });

// // Register event handler for new users joining the Twitch chat
// twitchClient.on('join', (channel, username, self) => {
//   if (self) return; // Ignore own join events
//   users.add(username);
//   console.log(`[Twitch] ${username} joined ${channel}`);
//   // Add your logic here if needed
// });

// twitchClient.on('part', (channel, username) => {
//   console.log(`User left: ${username}`);
//   users.delete(username);
// });

})
.catch(error => {
  // Handle errors if the promise is rejected
  console.error('An error occurred:', error);
});


function getAllUsers() {
  return Array.from(users);
}

module.exports = { twitchClient , getAllUsers };