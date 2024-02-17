const express = require('express');
const axios = require('axios');
const { exec } = require('child_process');
const DynamoDBManager = require('./dynamoDB'); 
const { initializeTwitchClient } = require('./twitchChat');
const DiscordModule = require('./discordModule');
// Create an instance of DiscordModule
const discordBot = new DiscordModule();


dotenv = require('dotenv').config()
//const { initializeDatabase } = require('./dynamoDB');
//const { initializeDatabase} = require('./database');
const { connectToYouTubeChat } = require('./youtubeChat');
const app = express();
const PORT = 3000;

// Twitch app credentials
const twitchClientId = process.env["TWITCH_CLIENT_ID"];
const twitchClientSecret = process.env["TWITCH_CLIENT_SECRET"];
const twitchRedirectUri = process.env["TWITCH_REDIRECT_URL"];

// YouTube API key
const youtubeApiKey = process.env["YT_API_KEY"];  // Obtain from Google Cloud Console
const youtubeChannelId = process.env["YT_CHANNELID"]; //this is the channel id // Replace with your YouTube channel username
const youtubeChannelUsername = process.env["YT_CHANNELNAME"];//accounts prior to a certain date don't have these
// Twitch API endpoints
const twitchAuthUrl = process.env["TWITCH_AUTHORISE_URL"];
const twitchTokenUrl = process.env["TWITCH_TOKEN_URL"];

// Initialize the discord bot by logging in with the token
const botToken = process.env["DISCORD_BOT_TOKEN"]; // Replace with your actual bot token

// State to prevent CSRF attacks
const state = 'your_random_state';

// dynamoDB settings
const dynamoDBManager = new DynamoDBManager(process.env["AWS_REGION"] , process.env["DYNAMO_TWITCH_USERS_TABLENAME"] , process.env["DYNAMO_YOUTUBE_USERS_TABLENAME"]);
const twitchTableSettings = { name: process.env["DYNAMO_TWITCH_USERS_TABLENAME"] }; 
const youtubeTableSettings = { name: process.env["DYNAMO_YOUTUBE_USERS_TABLENAME"] };

app.listen(PORT, async () => {
  try {
    // Initialize the database
    await dynamoDBManager.initializeDatabase(twitchTableSettings, youtubeTableSettings);

    console.log(`Server is running at http://localhost:${PORT}`);
    if(process.env["TWITCH_ENABLED"] == true)
    {
      exec(`start http://localhost:${PORT}/auth`);
    }
    else
    {
      connectToYouTubeChat(youtubeApiKey , youtubeChannelId , youtubeChannelUsername );
      discordBot.login(botToken);
    }

  } catch (error) {
    console.error('Error initializing the database:', error);
  }
});

// Route to initiate the authentication process
app.get('/auth', (req, res) => {
  const authParams = new URLSearchParams({
    client_id: twitchClientId,
    redirect_uri: twitchRedirectUri,
    response_type: 'code',
    scope: 'chat:read chat:edit', // Add additional scopes as needed
    state: state,
  });

  const authUrl = `${twitchAuthUrl}?${authParams.toString()}`;
  res.redirect(authUrl);
});

// Route to handle the Twitch callback
app.get('/auth/callback', async (req, res) => {
  const { code, state: returnedState } = req.query;

  // Check if the returned state matches the original state to prevent CSRF attacks
  if (returnedState !== state) {
    res.status(403).send('Invalid state');
    return;
  }

  try {
    // Exchange the authorization code for an access token
    const tokenResponse = await axios.post(twitchTokenUrl, null, {
      params: {
        client_id: twitchClientId,
        client_secret: twitchClientSecret,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: twitchRedirectUri,
      },
    });

    const accessToken = tokenResponse.data.access_token;

    // Print the access token (for demonstration purposes)
    //console.log(`Twitch Access Token: ${accessToken}`);

    // Connect to Twitch chat using the obtained access token
    //connectToTwitchChat(accessToken, process.env['TWITCH_CHANNEL']); // Replace with your Twitch channel name
    initializeTwitchClient(accessToken, process.env['TWITCH_CHANNEL'], process.env['TWITCH_BOT_USER']);

    // Connect to YouTube chat using the YouTube API key and channel username
    connectToYouTubeChat(youtubeApiKey , youtubeChannelId , youtubeChannelUsername );
    discordBot.login(botToken);

    res.send('Authentication successful! You can close this window now.');
  } catch (error) {
    console.error('Error during authentication:', error.response ? error.response.data : error.message);
    res.status(500).send('Authentication failed');
  }
});

// // Start the server (OLD)
// app.listen(PORT, async () => {
//   console.log(`Server is running at http://localhost:${PORT}`);
//   //initializeDatabase("localhost" , "stream_rewards" , "root" ,"password")
//   //initializeDatabase("localhost" , "stream_rewards")

//   exec(`start http://localhost:${PORT}/auth`);
// });