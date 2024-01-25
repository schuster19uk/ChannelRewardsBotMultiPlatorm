const { Client, GatewayIntentBits } = require('discord.js');

class DiscordModule {
    constructor() {
        // Define the necessary intents for your bot
        const intents = [
            GatewayIntentBits.Guilds, // Required for reading server information
            GatewayIntentBits.GuildMessages, // Required for reading messages
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

    handleMessage(message) {

        console.log('message recieved' + message)

        //author of the message
        const messageAuthor = message.author;
        const messageContent = message.content;

        // Your code to handle messages goes here
        //if (message.content === '!ping') {
            if(!messageAuthor.bot)
            {
                message.channel.send('Pong!');
            }

       // }
    }

    login(token) {
        this.client.login(token);
    }
}

module.exports = DiscordModule;