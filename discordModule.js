const { Client, GatewayIntentBits } = require('discord.js');
const DynamoDBManager = require('./dynamoDB');
const dotenv = require('dotenv').config();

class DiscordModule {
    constructor() {
        this.dynamoDBManager = new DynamoDBManager(process.env.AWS_REGION, process.env.DYNAMO_TWITCH_USERS_TABLENAME, process.env.DYNAMO_YOUTUBE_USERS_TABLENAME);

        const intents = [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            // Add other intents as needed
        ];

        this.client = new Client({
            intents,
            // Add other client options as needed
        });

        this.setupEvents();
    }

    setupEvents() {
        this.client.once('ready', () => {
            console.log('Bot is ready!');
        });

        this.client.on('messageCreate', (message) => {
            this.handleMessage(message);
        });

        this.client.on('error', (error) => {
            console.error('Discord.js error:', error);
        });

        this.client.on('warn', (warning) => {
            console.warn('Discord.js warning:', warning);
        });

        this.client.on('disconnect', (event) => {
            console.log(`Disconnected: ${event.reason || 'No reason provided'}`);
        });
    }

    async handleMessage(message) {

        console.log('message recieved: ');

        //author of the message
        const messageAuthor = message.author;
        let messageContent = message.content;

        //remove this line when done (REMOVE)
        messageContent = "!linkYT schusteruk"

        const isYoutubeLink = messageContent.startsWith('!linkYT') ? true : false;
        const isTwitchLink = messageContent.startsWith('!linkTwitch') ? true : false;

        if(isTwitchLink || isYoutubeLink) {

            //usermessage
            if(!messageAuthor.bot)
            {
                message.channel.send('Your link is being processed');
                
                try {
                    const userId = message.author.id; // Assuming Discord user ID is used as the Twitch user ID
                    const messageId = message.id; // Assuming Discord message ID is used
                    const displayName = message.author.username; // Assuming Discord username is used as display name

                    // send to DynamoDB some stuff
                    const discordUsername = messageAuthor.username
                    const discordUserId  = messageAuthor.id
                    const discordAvatarUrl = messageAuthor.displayAvatarURL // not being passed now
                    const discordGlobalName = messageAuthor.globalName // not used at the moment

                //get the twitch username or youtube username
                
                if(isTwitchLink) {
                    let twitchUserStr = messageContent.replace('!linkTwitch','');
                    twitchUserStr = twitchUserStr.split(' ');
                    twitchUserStr = twitchUserStr.filter(element => element !== "");
                    if(twitchUserStr.length > 0)
                    {
                        twitchUserStr = twitchUserStr[0];
                        const result = await this.dynamoDBManager.addDiscordInfoToTwitchUser(twitchUserStr, discordUserId, discordUsername)
                        console.log('linking twitch user : ' + JSON.stringify(result));

                        if (result == 'OK')
                        {
                            console.log(`${discordUsername}` + ' your Twitch Username has been registered successfully');
                            message.channel.send(`${discordUsername}` + ' your Twitch Username has been registered successfully');
                        }
                        else
                        {
                            console.log(`Hey ${discordUsername} , ` + result);
                            message.channel.send(`Hey ${discordUsername} , ` + result);
                        }
                    }
                }

                if(isYoutubeLink) {

                    let youtubeUserStr = messageContent.replace('!linkYT','');
                    youtubeUserStr = youtubeUserStr.split(' ');
                    youtubeUserStr = youtubeUserStr.filter(element => element !== "");
                    if(youtubeUserStr.length > 0)
                    {
                        youtubeUserStr = youtubeUserStr[0];
                        //added in here for now (REMOVE when youtube stuffs is ready)
                        const addPointsYT = await this.dynamoDBManager.addPointsToYoutubeUser(youtubeUserStr, parseInt(5), discordUserId, '3455', discordUsername , new Date().toISOString());
                    
                        const result = await this.dynamoDBManager.addDiscordInfoToYoutubeUser(youtubeUserStr, discordUserId, discordUsername)
                        if (result == 'OK')
                        {
                            console.log(`${discordUsername}` + ' your Youtube Username has been registered successfully');
                            message.channel.send(`${discordUsername}` + ' your Youtube Username has been registered successfully');
                        }
                        else
                        {
                            console.log(`Hey ${discordUsername} , ` + result);
                            message.channel.send(`Hey ${discordUsername} , ` + result);
                        }
                                           
                    }
                }

                } 
                catch (error) {
                    console.error('Error linking user:', error);
                    message.channel.send('An error occurred while adding points. Please try again later.');
                } 
            }
        }
        else {
            //for now if its not a link do nothing
        }
    }

    async sendMessage(channelId, message) {
        const channel = this.client.channels.cache.get(channelId);
        if (channel) {
            channel.send(message);
        } else {
            console.error(`Channel with ID ${channelId} not found.`);
        }
    }

    login(token) {
        this.client.login(token);
    }
}

module.exports = DiscordModule;