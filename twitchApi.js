const axios = require('axios');

// Function to retrieve chatters in a Twitch channel
async function getTwitchChatters(channel, accessToken, clientId) {
  try {
    const response = await axios.get(`https://api.twitch.tv/helix/chatters?broadcaster_id=${channel}`, {
      headers: {
        'Client-ID': clientId,
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    // Extract and return the list of chatters
    return response.data.data.chatters;
  } catch (error) {
    console.error('Error retrieving chatters:', error.message);
    return [];
  }
}

module.exports = getTwitchChatters;

// // Example usage
// const channelToMonitor = 'channel_to_monitor';
// const accessToken = 'your_oauth_token'; // Ensure this token has the required scope

// getChatters(channelToMonitor, accessToken)
//   .then((chatters) => {
//     console.log('Chatters in Twitch chat:', chatters);
//   })
//   .catch((error) => {
//     console.error('Error:', error.message);
//   });