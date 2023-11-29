const axios = require('axios');
require('dotenv').config()

let twitchOpts = {
    identity: {
      username: 'schusterUK', // bot username
      password: 'your_twitch_oauth_token', // password / oauth token
    },
    channels: [process.env['TWITCH_CHANNELS']],
    connection: {
        secure: true,
      },
  };

  let setTwitchOptions = function(token){
    console.log('setting token on options by validation code ' + token);
    twitchOpts.identity.password = token;
  }

  const getTokenClientCredentialsFlow = async () => {
    const scopes = ['chat:read' , 'chat:edit' , 'user:bot' , 'user:read:chat' , 'channel:bot' , 'channel:moderate'];
    // try {
    //     // Define the required scopes
    //   const scopes = ['chat:read', 'chat:write'];
    //   const response =  await axios.post('https://id.twitch.tv/oauth2/token', null, {
    //     params: {
    //       client_id: process.env.TWITCH_CLIENT_ID,
    //       client_secret: process.env.TWITCH_CLIENT_SECRET,
    //       grant_type: 'client_credentials',
    //       scope: scopes.join(' '),
    //     },
    //   });
  
    //   if (response.data.access_token) {
    //     setTwitchOptions(response.data.access_token);
    //     process.env.TWITCH_ACCESS_TOKEN = response.data.access_token;
    //     console.log('Successfully obtained Twitch access token:', response.data.access_token);
    //   } else {
    //     throw new Error('Unable to retrieve Twitch token.');
    //   }
    // } catch (error) {
    //   console.error('Error while obtaining Twitch token:', error.message);
    //   throw new Error('Failed to obtain Twitch token.');
    // }
    // try {
    //     const response = await axios.post('https://id.twitch.tv/oauth2/token', null, {
    //       params: {
    //         client_id: process.env.TWITCH_CLIENT_ID,
    //         client_secret: process.env.TWITCH_CLIENT_SECRET,
    //         grant_type: 'client_credentials',
    //         //scope: scopes.join(' '),
    //       },
    //     });
    
    //     // Extract and print the access token
    //     const accessToken = response.data.access_token;
    //     console.log(`Access Token: ${accessToken}`);
    //   } catch (error) {
    //     console.error('Error obtaining OAuth token:', error.message);
    //   }  


      try {
        const response = await axios.post(
          'https://id.twitch.tv/oauth2/token',
          null,
          {
            params: {
              client_id: process.env.TWITCH_CLIENT_ID,
              client_secret: process.env.TWITCH_CLIENT_SECRET,
              grant_type: 'client_credentials',
              scope: scopes.join(' '),
            },
          }
        );
    
        // Extract and print the access token
        const accessToken = response.data.access_token;
        process.env.TWITCH_ACCESS_TOKEN = response.data.access_token;
        console.log(`Access Token: ${accessToken}`);
        setTwitchOptions(`oauth:${response.data.access_token}`);
        return `oauth:${response.data.access_token}`
      } catch (error) {
        console.error('Error obtaining OAuth token:', error.message);
        console.error('Response data:', error.response ? error.response.data : 'N/A');
      }


};


const getToken = async () => {
    const scopes = ['chat:read' , 'chat:edit' , 'user:bot' , 'user:read:chat' , 'channel:bot' , 'channel:moderate'];

      try {
        const response = await axios.get(
          `https://id.twitch.tv/oauth2/authorize?response_type=code&client_id=${process.env.TWITCH_CLIENT_ID}&redirect_uri=${process.env.TWITCH_REDIRECT}&scope=${scopes.join(' ')}`,
           null,
        //   {
        //     params: {
        //       response_type:'token',
        //       client_id: process.env.TWITCH_CLIENT_ID,
        //       redirect_uri: process.env.TWITCH_REDIRECT_URI,
        //       scope: scopes.join(' '),
        //     },
        //   }
        );
    
        // Extract and print the access token
        const accessToken = response.data.access_token;
        process.env.TWITCH_ACCESS_TOKEN = response.data.access_token;
        console.log(`Access Token: ${accessToken}`);
        setTwitchOptions(`oauth:${response.data.access_token}`);
        return `oauth:${response.data.access_token}`
      } catch (error) {
        console.error('Error obtaining OAuth token:', error.message);
        console.error('Response data:', error.response ? error.response.data : 'N/A');
      }


};

// https://id.twitch.tv/oauth2/authorize?response_type=token&client_id=t7kyrxjq326tij087ax7o8a6y686d8&redirect_uri=http://localhost:3000&scope=chat%3Aread&state=c3ab8aa609ea11e793ae92361f002671


// this no longer exists because twitch remvoed this functionality
  const validateToken = async () => {
    let r
    try {
        // const response = await axios.post('https://id.twitch.tv/oauth2/validate', null, {
        //     headers: {
        //         "Authorization": `Bearer ${process.env['TWITCH_ACCESS_TOKEN']}`
        //     },
        //   });

          const response = await axios.post(
            'https://id.twitch.tv/oauth2/validate',
            null,
            {
                headers: {
                    "Authorization": `OAuth ${process.env['TWITCH_ACCESS_TOKEN']}`
                },
            }
          );

    } catch (error) {
        console.log('Invalid token. Getting a new one')
        await getToken();
    }
  }



  let getOptions = twitchOpts


  module.exports = {
    getToken , getOptions , validateToken
  };

 