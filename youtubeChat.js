const { google } = require('googleapis');
const axios = require('axios');
const DynamoDBManager = require('./dynamoDB'); 
const DiscordModule = require('./discordModule');
dotenv = require('dotenv').config();

//rewards points
const rewardPoints = parseInt(process.env["REWARD_POINTS"]);
const discordMilestoneChannelId = process.env["DISCORD_CHANNEL_ID_TO_POST_REWARDS"]

// Initialize DynamoDBManager
const dynamoDBManager = new DynamoDBManager(process.env.AWS_REGION, process.env["DYNAMO_TWITCH_USERS_TABLENAME"] , process.env["DYNAMO_YOUTUBE_USERS_TABLENAME"]); // Update with your AWS region


// Instantiate DiscordModule
const discordModule = new DiscordModule();


async function getYouTubeLiveVideoId(apiKey,   channelId , channelUsername ) {
  try {
    let YTchannelId;

    if (!channelId) {
      // Get the channel ID using the channel username if provided
      const channelResponse = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
        params: {
          part: 'id',
          forUsername: channelUsername,
          key: apiKey,
        },
      });

      YTchannelId = channelResponse.data.items[0].id;
    } else {
      YTchannelId = channelId;
    }

    let liveVideoId = null;
    // Use a do-while loop to call the YouTube API every minute until a live video is found or a certain condition is met
    do {
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
      liveVideoId = liveBroadcastResponse.data.items[0]?.id.videoId;

      if (!liveVideoId) {
        console.log('No active live video found for the given channel. Retrying in 1 minute...');
        // Wait for 1 minute (60,000 milliseconds) before retrying
        await new Promise(resolve => setTimeout(resolve, 60000));
      }
      else {
        console.log('live streaming id obtained')
      }

    } while (!liveVideoId);

    console.log(`YouTube Live Video ID: ${liveVideoId}`);
    return liveVideoId;
  } catch (error) {
    console.error('Error during YouTube Live video ID retrieval:', error.response ? error.response.data : error.message);
    return null;
  }
}

async function connectToYouTubeChat(apiKey, channelId , channelUsername) {
  const YTAPIKey = apiKey;
  const liveVideoId = await getYouTubeLiveVideoId(apiKey, channelId , channelUsername);

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
    const newdate = new Date().toLocaleTimeString();
    console.log('polling youtube: ' + newdate);
  }, 30000); // Poll every 2 minutes
}


//get live chat messages

// to do 
// 1 build some mechanism to detect if it is still going through messages as the previous poll could still be processing data
// 2. mark the messages that have been processed as recieved so we don't go through them again
// 3.find a way to make this process as streamlined as possible 
// as we don't want to process all the messages all the time
let isProcessing = false;

async function pollLiveChat(apiKey, liveChatId, targetChannelId) {
  const youtube = google.youtube('v3');
  let pageToken = null;

  async function processMessages(liveChatMessages) {
    const messages = liveChatMessages.data.items || [];

    if (messages.length > 0) {
      let groupedMessagesByAuthor = groupAndSortMessages(messages);
      for (const authorChannelId in groupedMessagesByAuthor) {
        
        // these are the author messages
        const authorMessages = groupedMessagesByAuthor[authorChannelId];
        console.log('number of messages: ' + authorMessages.length);
        let displayFirstMessageOnly = 0;

        // authors last message date from Youtube 
        // (page might not need to be processed at all if last message is earlier than db one)
        const LastMessage = authorMessages[authorMessages.length - 1];
        const LastMessageDate = LastMessage.publishedAtString;
        const LastMessageDateUTC = LastMessage.publishedAt;
        const userName = LastMessage.userName;
        const messageId = LastMessage.messageID;
        const displayName = LastMessage.displayName;
        const userId = LastMessage.userId;

        const youtubeUser = await dynamoDBManager.getYoutubeUserByUserId(userId); // get user object
        if(youtubeUser)
        {
          AuthorDBLastMessageDate = new Date(youtubeUser.last_message_date.S.toString()).toISOString();
        }
        else
        {
          AuthorDBLastMessageDate = new Date(-1).toISOString();
        }
        // if last message date is greater than date in db then process page
        if(LastMessageDate > AuthorDBLastMessageDate)
        {

          // there are messages in here that we haven't processed
          // get the unprocessed messages

          // go through each message in ascending order (redeeming is done via discord)
          let rewardPointsSum = 0;
          let authorsName;
          authorMessages.forEach((message) => {

            //message is after the last published message (add points)
            if(message.publishedAtString > AuthorDBLastMessageDate)
            {
                rewardPointsSum = parseInt(rewardPointsSum + rewardPoints);
            }
            
            if (displayFirstMessageOnly <= 0) {

              authorsName = message.displayName;
              // do something with these messages
              console.log(`Author: ${authorChannelId}`);
              console.log(`Name: ${message.displayName}`)
              console.log(`Message: ${message.text}`);
              console.log(`Published At: ${message.publishedAt}`);
              console.log("---");
            }
            displayFirstMessageOnly++;
          

          });

          // after all messages have been aggregated then update the db. 
          const addResult = await dynamoDBManager.addPointsToYoutubeUser(userName, parseInt(rewardPointsSum), userId, messageId, displayName ,LastMessageDate , LastMessageDateUTC );
 
          // handle CTA (Call To Action)
          // count messages

          if(authorMessages.length > 5)
          {
            sendMessageToYoutubeChat(` ${authorsName} , you are very close to a reward. Your contribution in chat helps you reach the goal.`)
          }

          //check if goal has been met (if so send to discord)
          if(1==1)
          {
            // Send message to Discord
            discordModule.sendMessage(discordMilestoneChannelId, `Congrats Youtube Milestone reached ${authorsName} , type in !redeemYTStandard to claim.` );
          }

        }

      }
      console.log('pageToken: ' + liveChatMessages.data.nextPageToken);
      pageToken = liveChatMessages.data.nextPageToken;
    } else {
      
      
      if (liveChatMessages.data.pageInfo.resultsPerPage == 0)
      {
        console.log('pageToken returned no results no more messages. Waiting for next poll. ');
        isProcessing = false;
        pageToken = null;
      }
    }
  }

  async function sendMessageToYoutubeChat(text) {
    const youtube = google.youtube({
      version: 'v3',
      auth: apiKey, // Using API key for authentication
    });
  
    try {
      const response = await youtube.liveChatMessages.insert({
        part: 'snippet',
        requestBody: {
          snippet: {
            liveChatId,
            type: 'textMessageEvent',
            textMessageDetails: {
              text,
            },
          },
        },
      });
  
      console.log('Message sent successfully:', response.data);
    } catch (error) {
      console.error('Error sending message:', error.message);
    }
  }

  async function delayAndCallAPI() {
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          const liveChatMessages = await youtube.liveChatMessages.list({
            auth: apiKey,
            liveChatId: liveChatId,
            part: 'id,snippet,authorDetails',
            maxResults: 100,
            pageToken: pageToken,
          });
          resolve(liveChatMessages);
        } catch (error) {
          reject(error);
        }
      }, 3000); // Delay for 3 seconds
    });
  }

  do {
    if (!isProcessing) {
      isProcessing = true;
      try {
        console.log('Getting live chat messages');
        const liveChatMessages = await delayAndCallAPI();
        await processMessages(liveChatMessages);
      } catch (error) {
        console.error('Error while processing live chat messages:', error);
      }
      isProcessing = false;
    }
  } while (pageToken);
}

function groupAndSortMessages(messages) {
  // Create an object to store messages grouped by author
  const messagesByAuthor = {};

  // Iterate over each message
  messages.forEach((message) => {
    // Extract relevant data
    const { publishedAt, authorChannelId } = message.snippet;
    const { displayName} = message.authorDetails;
    

    // Check if the author's channel ID exists in the messagesByAuthor object
    if (!messagesByAuthor[authorChannelId]) {
      // If not, initialize an array to store messages for this author
      messagesByAuthor[authorChannelId] = [];
    }

    // Add the message to the array of messages for this author
    messagesByAuthor[authorChannelId].push({
      userId: authorChannelId,
      displayName: displayName,
      userName: displayName.replace(' ',''),
      messageID: message.id,
      text: message.snippet.textMessageDetails.messageText,
      publishedAt: new Date(publishedAt),
      publishedAtString: new Date(publishedAt).toISOString(),
    });
  });

  // Iterate over each author's messages and sort them by publishedAt in ascending order
  for (const authorChannelId in messagesByAuthor) {
    messagesByAuthor[authorChannelId].sort((a, b) => a.publishedAt - b.publishedAt);
  }

  return messagesByAuthor;
}

module.exports = { connectToYouTubeChat };