const { google } = require('googleapis');
const axios = require('axios');

async function getYouTubeLiveVideoId(apiKey, channelUsername) {
  try {
    // Get the channel ID using the channel username
    const channelResponse = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
      params: {
        part: 'id',
        forUsername: channelUsername,
        key: apiKey,
      },
    });

    const channelId = channelResponse.data.items[0].id;

    // Get the live broadcast details for the channel
    const liveBroadcastResponse = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'id',
        channelId: channelId,
        eventType: 'live',
        type: 'video',
        key: apiKey,
      },
    });

    // Extract the live video ID
    const liveVideoId = liveBroadcastResponse.data.items[0]?.id.videoId;

    if (!liveVideoId) {
      console.error('No active live video found for the given channel.');
      return null;
    }

    console.log(`YouTube Live Video ID: ${liveVideoId}`);
    return liveVideoId;
  } catch (error) {
    console.error('Error during YouTube Live video ID retrieval:', error.response ? error.response.data : error.message);
    return null;
  }
}

async function connectToYouTubeChat(apiKey, channelUsername) {
  const liveVideoId = await getYouTubeLiveVideoId(apiKey, channelUsername);

  if (!liveVideoId) {
    console.error('YouTube Live video ID retrieval failed.');
    return;
  }

  const youtube = google.youtube('v3');

  // Get live chat ID
  const liveChatResponse = await youtube.videos.list({
    auth: apiKey,
    part: 'liveStreamingDetails',
    id: liveVideoId,
  });

  const liveChatId = liveChatResponse.data.items[0]?.liveStreamingDetails?.activeLiveChatId;

  if (!liveChatId) {
    console.error('No active live chat found for the given video ID.');
    return;
  }

  // Set up the live chat polling
  setInterval(() => {
    pollLiveChat(apiKey, liveChatId);
  }, 5000); // Poll every 5 seconds (adjust as needed)
}

async function pollLiveChat(apiKey, liveChatId) {
  const youtube = google.youtube('v3');

  const liveChatMessages = await youtube.liveChatMessages.list({
    auth: apiKey,
    liveChatId: liveChatId,
    part: 'id,snippet,authorDetails',
  });

  liveChatMessages.data.items.forEach((message) => {
    const author = message.snippet.authorDetails.displayName;
    const text = message.snippet.displayMessage;

    console.log(`[${author}] ${text}`);
  });
}

module.exports = { connectToYouTubeChat };