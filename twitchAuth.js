const express = require('express');
const axios = require('axios');
const { exec } = require('child_process');
const { initializeTwitchClient } = require('./twitchChat');
dotenv = require('dotenv').config()
const { initializeDatabase } = require('./dynamoDB');
//const { initializeDatabase} = require('./database');
//const { connectToYouTubeChat } = require('./youtubeChat');
console.log(process.env)
const app = express();
const PORT = 3000;

// Twitch app credentials
const twitchClientId = process.env["TWITCH_CLIENT_ID"];
const twitchClientSecret = process.env["TWITCH_CLIENT_SECRET"];
const twitchRedirectUri = process.env["TWITCH_REDIRECT_URL"];

// YouTube API key
const youtubeApiKey = process.env["YT_API_KEY"]; //'AIzaSyBs1ymT2dbGDZHlfTaRHeh_sOOb3w7FYNA'; // Obtain from Google Cloud Console
const youtubeChannelId = process.env["YT_CHANNELID"]; //'UCwsyRVF3X7RylJJi7nct0qQ'; //this is the channel id // Replace with your YouTube channel username
const youtubeChannelUsername = process.env["YT_CHANNELNAME"];//accounts prior to a certain date don't have these
// Twitch API endpoints
const twitchAuthUrl = process.env["TWITCH_AUTHORISE_URL"];
const twitchTokenUrl = process.env["TWITCH_TOKEN_URL"];

// State to prevent CSRF attacks
const state = 'your_random_state';

// Initialize the database when the server starts
initializeDatabase("localhost", "stream_rewards", "root", "password")
  .then(() => {
    // The server will start after the database is initialized
    app.listen(PORT, async () => {
      console.log(`Server is running at http://localhost:${PORT}`);
      exec(`start http://localhost:${PORT}/auth`);
    });
  })
  .catch((error) => {
    console.error('Error initializing the database:', error);
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
    //connectToYouTubeChat(youtubeApiKey , youtubeChannelId , youtubeChannelUsername );

    res.send('Authentication successful! You can close this window now.');
  } catch (error) {
    console.error('Error during authentication:', error.response ? error.response.data : error.message);
    res.status(500).send('Authentication failed');
  }
});

// Start the server
app.listen(PORT, async () => {
  console.log(`Server is running at http://localhost:${PORT}`);
  //initializeDatabase("localhost" , "stream_rewards" , "root" ,"password")
  //initializeDatabase("localhost" , "stream_rewards")

  exec(`start http://localhost:${PORT}/auth`);
});