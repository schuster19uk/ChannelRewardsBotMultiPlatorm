const WebSocket = require('ws');

function connectToTwitchChat(username, token, channel) {
  const ws = new WebSocket('wss://irc-ws.chat.twitch.tv:443');

  ws.on('open', () => {
    console.log('WebSocket connection opened');
    // Authentication
    ws.send(`PASS ${token}`);
    ws.send(`NICK ${username}`);
    ws.send(`JOIN #${channel}`);
  });

  ws.on('message', (data) => {
    const message = data.toString();
    console.log('Received:', message);

    if (message.includes('Error')) {
      console.error('Error occurred during authentication:', message);
    }

    // Check for authentication success
    if (message.includes('Welcome, GLHF!')) {
      console.log('Authentication successful. Connected to Twitch chat.');
    }
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });

  ws.on('close', (code, reason) => {
    console.log(`WebSocket closed. Code: ${code}, Reason: ${reason}`);
  });
}

module.exports = {
  connectToTwitchChat,
};