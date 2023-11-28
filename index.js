const got = require('got')
require('dotenv').config()

let userId = ""
let headers = {}
let rewardId = ""
let pollingInterval

const twitchAuth = require('./twitchAuth');


//const twitchChatWebSocket = require('./twitchChatClientWebSockets');

// Replace these with your actual Twitch username, OAuth token, and channel
const username = 'your_twitch_username';
const token = 'oauth:your_oauth_token';
const channel = 'channel_to_join';


// const getTokenFunction = async () => {
//   try {
//     await twitchAuth.validateToken();
//     // Other asynchronous code or processing
//   } catch (error) {
//     console.error('Error:', error.message);
//   }
// };


// getTokenFunction().then(result => {

// let twitchOptions = twitchAuth.getOptions

// // Call the function to connect to Twitch chat
// twitchChatWebSocket.connectToTwitchChat(twitchOptions.identity.username, twitchOptions.identity.password, twitchOptions.channels[0]);

// })
// .catch(error => {
//   // Handle errors if the promise is rejected
//   console.error('An error occurred:', error);
// });





// connect to twitch using tmi
const twitchModule = require('./twitch');
//const youtubeModule = require('./youtube');
//const databaseModule = require('./database');

//twitch appi stuff 
//const {getTwitchChatters} = require('./twitchApi');

// Example usage
const channelToMonitor = 'channel_to_monitor';
const accessToken = 'your_oauth_token'; // Ensure this token has the required scope


// getTwitchChatters(channelToMonitor, accessToken, clientId)
//   .then((chatters) => {
//     console.log('Chatters in Twitch chat:', chatters);
//   })
//   .catch((error) => {
//     console.error('Error:', error.message);
//   });


// // Set up timer to add points for every minute a user has been in Twitch chat
// setInterval(() => {
//   twitchModule.twitchClient.getChannels().forEach((channel) => {
//     twitchModule.twitchClient.getUsers(channel).forEach((user) => {
//       console.log('doing twitch stuff');
//       //databaseModule.getAndUpdateTwitchPointsFromDatabase(user.username, 5);
//     });
//   });
// }, 60000); // 60000 milliseconds = 1 minute

// // Set up timer to add points for every minute a user has been in YouTube chat
// setInterval(() => {
//   youtubeModule.getLiveChatMessages('your_youtube_video_id').then((messages) => {
//     const uniqueUsers = new Set(messages.map((message) => message.authorDetails.displayName));
//     uniqueUsers.forEach((username) => {
//       databaseModule.getAndUpdateYouTubePointsFromDatabase(username, 5);
//     });
//   });
// }, 60000);


// // Set up timer to add points for every minute a user has been in YouTube chat
// setInterval(() => {
//     youtubeModule.getLiveChatUsers('your_youtube_video_id').then((users) => {
//       users.forEach((username) => {
//         console.log('doing youtube stuff');
//         //databaseModule.getAndUpdateYouTubePointsFromDatabase(username, 5);
//       });
//     });
//   }, 60000);


  // validates the provided token and validates the token has the correct scope(s). additionally, uses the response to pull the correct client_id and broadcaster_id



// const getToken = async () => {
//   try {
//     const response = await axios.post('https://id.twitch.tv/oauth2/token', null, {
//       params: {
//         client_id: clientId,
//         client_secret: clientSecret,
//         grant_type: 'client_credentials',
//       },
//     });

//     if (response.data.access_token) {
//       process.env['TWITCH_ACCESS_TOKEN'] = response.data.access_token
//       console.log('access_token from twitch' + process.env['TWITCH_ACCESS_TOKEN'])
//     } else {
//       throw new Error('Unable to retrieve Twitch token.');
//     }
//   } catch (error) {
//     throw new Error(`Error: ${error.message}`);
//   }
// } 
