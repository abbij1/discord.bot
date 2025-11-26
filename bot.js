const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');

const app = express();
// CRITICAL FIX 1: Render provides a port in process.env.PORT. 
// If you force port 3000, Render will think the app failed to start.
const port = process.env.PORT || 3000;

// Keep-alive server
app.get('/', (req, res) => {
  res.send('Discord Bot is running!');
});

app.listen(port, () => {
    // CRITICAL FIX 2: Fixed syntax error. Added backticks (`) around the string.
    console.log(`🔄 Keep-alive server running on port ${port}`);
});

// Your Discord bot
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.on('ready', () => {
    // CRITICAL FIX 3: Fixed syntax error. Added backticks (`) around the string.
    console.log(`✅ Bot is online as ${client.user.tag}`);
});

client.on('messageCreate', (message) => {
    if (message.author.bot) return;
    
    // Good practice: trim() removes accidental spaces at start/end
    const content = message.content.toLowerCase().trim();
    
    // Debugging: This prints what the bot hears to the Render Logs. 
    // If this prints empty strings, your "Message Content Intent" is OFF in Developer Portal.
    console.log(`Received message: ${content}`); 

    if (content === 'hi' || content === 'hello') {
        message.channel.send('haiii');
    }
    if (content === 'aya') {
        message.channel.send('fat and retarded');
    }
    if (content === 'oron') {
        message.channel.send('your daddy');
    }
    if (content === 'abbi') {
        message.channel.send('best kitten');
    }
});

// CRITICAL FIX 4: Never hardcode the token. 
// We will set this in the Render Dashboard.
const TOKEN = process.env.DISCORD_TOKEN;

if (!TOKEN) {
    console.error("❌ Error: DISCORD_TOKEN is missing in Environment Variables!");
} else {
    client.login(TOKEN);
}