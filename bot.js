require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.on('ready', () => {
    console.log(`✅ Bot is online as ${client.user.tag}`);
});

// Get token from .env file
const TOKEN = process.env.DISCORD_TOKEN;

client.login(TOKEN);

// Define your “commands” as functions in an object for easy management
const commands = {
    hello: async (message) => {
        await message.channel.send('haii');
    },
    aya: async (message) => {
        await message.channel.send('is fat and retarded!');
    },
    oron: async (message) => {
        await message.channel.send('your daddy');
    },
    abbi: async (message) => {
        await message.channel.send('best ekitten');
    },
    // Add more commands here
    // Example: bye: async (message) => { await message.channel.send('Goodbye!'); }
};

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async (message) => {
    // Ignore messages from bots (including itself)
    if (message.author.bot) return;

    // Convert message to lowercase for case-insensitive matching
    const content = message.content.toLowerCase();

    // Check if the message matches a “command”
    if (commands[content]) {
        await commands[content](message);
    }
});

// Log in the bot
client.login(TOKEN);
