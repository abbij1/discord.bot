require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');

const app = express();
const port = process.env.PORT || 3000;

// Keep-alive server - prevents Render from sleeping
app.get('/', (req, res) => {
  res.send('🤖 Discord Bot is running!');
});

// Start the web server
app.listen(port, () => {
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
    console.log(`✅ Bot is online as ${client.user.tag}`);
});

client.login(process.env.DISCORD_TOKEN);