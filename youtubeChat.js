const { google } = require('googleapis');
const axios = require('axios');

async function getYouTubeLiveVideoId(apiKey, channelId, channelUsername) {
  try {
    
    let YTchannelId
    
    if(!channelId)
    {
    // Get the channel ID using the channel username
    const channelResponse = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
      params: {
        part: 'id',
        forUsername: channelUsername,
        key: apiKey,
      },
    });

     YTchannelId = channelResponse.data.items[0].id;

    }else{
      YTchannelId = channelId;
    }


    //channelId is on the page
    // I don't have a channel username so I can skip this function call above

    // Get the live broadcast details for the channel
    const liveBroadcastResponse = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'id',
        channelId: YTchannelId,
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
  }, 60000); // Poll every 5 seconds (adjust as needed)
}


//get live chat messages

// to do 
// 1 build some mechanism to detect if it is still going through messages as the previous poll could still be processing data
// 2. mark the messages that have been processed as recieved so we don't go through them again
// 3.find a way to make this process as streamlined as possible 
// as we don't want to process all the messages all the time

async function pollLiveChat(apiKey, liveChatId, targetChannelId) {
  const youtube = google.youtube('v3');
  let pageToken = null;

  do {
    const liveChatMessages = await youtube.liveChatMessages.list({
      auth: apiKey,
      liveChatId: liveChatId,
      part: 'id,snippet,authorDetails',
      maxResults: 100,
      pageToken: pageToken,
    });

    const messages = liveChatMessages.data.items || [];

    // Filter messages based on a specific time range and author
    const startTime = new Date('2023-01-01T00:00:00Z');
    const endTime = new Date('2023-01-02T00:00:00Z');

    const filteredMessages = messages
      .filter((message) => {
        const publishedAt = new Date(message.snippet.publishedAt);
        const authorChannelId = message.authorDetails.channelId;

        return (
          startTime <= publishedAt &&
          publishedAt <= endTime &&
          authorChannelId === targetChannelId
        );
      })
      .map((message) => {
        // Extract message details including text
        const { textMessageDetails, publishedAt, authorDetails } = message.snippet;
        const authorChannelId = authorDetails.channelId;

        return {
          text: textMessageDetails.messageText,
          publishedAt: publishedAt,
          author: {
            channelId: authorChannelId,
          },
        };
      });

    // Do something with the filtered messages
    filteredMessages.forEach((message) => {
      console.log(`Message: ${message.text}, Author: ${message.author.channelId}, Published At: ${message.publishedAt}`);
    });

    // Update the pageToken for the next iteration
    pageToken = liveChatMessages.data.nextPageToken;

  } while (pageToken);
}

module.exports = { connectToYouTubeChat };