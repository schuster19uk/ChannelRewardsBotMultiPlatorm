// youtube.js
const { google } = require('googleapis');
//const databaseModule = require('./database');

// Replace your_youtube_api_key with your actual YouTube API key
const youtubeApiKey = 'your_youtube_api_key';

// Function to retrieve live chat messages using the YouTube Data API
async function getLiveChatMessages(videoId) {
  const youtube = google.youtube('v3');
  const res = await youtube.liveChatMessages.list({
    auth: youtubeApiKey,
    part: 'id,snippet,authorDetails',
    liveChatId: videoId,
    maxResults: 200,
  });
  return res.data.items;
}

// Function to retrieve live chat users using the YouTube Data API
async function getLiveChatUsers(videoId) {
    const youtube = google.youtube('v3');
    const res = await youtube.liveChatMessages.list({
      auth: youtubeApiKey,
      part: 'id,snippet,authorDetails',
      liveChatId: videoId,
      maxResults: 200,
    });
  
    // Extract unique usernames
    const uniqueUsers = new Set(res.data.items.map((message) => message.authorDetails.displayName));
    
    return Array.from(uniqueUsers);
  }

// Function to create YouTube users table
//databaseModule.createYouTubeUsersTable();

// Export other functions or variables as needed

module.exports = { getLiveChatMessages , getLiveChatUsers };