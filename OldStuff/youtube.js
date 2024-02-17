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


    // const filteredMessages = messages
    //   .filter((message) => {
    //     const publishedAt = new Date(message.snippet.publishedAt);
    //     const authorChannelId = message.authorDetails.channelId;

    //     return (
    //       startTime <= publishedAt &&
    //       publishedAt <= endTime &&
    //       authorChannelId === targetChannelId
    //     );
    //   })
    //   .map((message) => {
    //     // Extract message details including text
    //     const { textMessageDetails, publishedAt, authorDetails } = message.snippet;
    //     const authorChannelId = authorDetails.channelId;

    //     return {
    //       text: textMessageDetails.messageText,
    //       publishedAt: publishedAt,
    //       author: {
    //         channelId: authorChannelId,
    //       },
    //     };
    //   });


    // const filteredMessages = messages
    // .filter((message) => {
    //   const publishedAt = new Date(message.snippet.publishedAt);
    //   const authorChannelId = message.authorDetails.channelId;
  
    //   return (
    //     startTime <= publishedAt &&
    //     publishedAt <= endTime &&
    //     authorChannelId === targetChannelId
    //   );
    // })
    // .sort((a, b) => {
    //   // Sort by publishedAt in ascending order
    //   return new Date(a.snippet.publishedAt) - new Date(b.snippet.publishedAt);
    // })
    // .map((message) => {
    //   // Extract message details including text
    //   const { textMessageDetails, publishedAt, authorDetails } = message.snippet;
    //   const authorChannelId = authorDetails.channelId;
  
    //   return {
    //     text: textMessageDetails.messageText,
    //     publishedAt: publishedAt,
    //     author: {
    //       channelId: authorChannelId,
    //     },
    //   };
    // });
  
    //   // Do something with the filtered messages
    //   filteredMessages.forEach((message) => {
    //     console.log(`Message: ${message.text}, Author: ${message.author.channelId}, Published At: ${message.publishedAt}`);
    //   });