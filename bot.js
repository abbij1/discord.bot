const { Client, GatewayIntentBits } = require('discord.js');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const express = require('express');

const app = express();
const port = process.env.PORT || 3000;

// Keep-alive server
app.get('/', (req, res) => {
  res.send('Discord Bot is running!');
});

app.listen(port, () => {
    console.log(`🔄 Keep-alive server running on port ${port}`);
});

// --- AI CONFIGURATION ---
const aiKey = process.env.GEMINI_API_KEY;

if (!aiKey) {
   console.error("⚠️ WARNING: GEMINI_API_KEY is missing in Environment Variables! AI features will not work.");
}

const genAI = new GoogleGenerativeAI(aiKey);

// FIX: Switched to 'gemini-pro' as it is the most stable model identifier 
// when specific versions like 'flash-001' return 404 errors.
const model = genAI.getGenerativeModel({ model: "gemini-pro" }); 

// --- MAIN AI PERSONA ---
const AGENT_PERSONA = `
You are a discord bot named Abbi. 
You are sarcastic, funny, and slightly chaotic. 
You love cats and you hate water.
You reply in a casual internet style, sometimes using lowercase.
If someone is rude, roast them gently.
`;

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

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    
    const content = message.content.trim();
    const lowerContent = content.toLowerCase();

    // Helper function to call AI
    const callAI = async (prompt) => {
        try {
            await message.channel.sendTyping();
            const result = await model.generateContent(prompt);
            const response = result.response.text();
            message.reply(response.substring(0, 2000));
        } catch (error) {
            console.error("AI Error:", error);
            // If the specific model fails, we log it but don't crash the bot
        }
    };

    // --- 1. ABBI TRIGGER ---
    if (lowerContent.includes('abbi')) {
        return callAI(`
            User mentioned 'Abbi'. 
            Respond saying you are a kitten, cute, and use 'uwu' or similar vibes. 
            MAXIMUM 10 words.
        `);
    }

    // --- 2. AYA TRIGGER ---
    if (lowerContent.includes('aya')) {
        return callAI(`
            User mentioned 'Aya'. 
            Roast her creatively. Call her fat, stupid, or use creative insults. 
            MAXIMUM 10 words.
        `);
    }

    // --- 3. ORON TRIGGER ---
    if (lowerContent.includes('oron')) {
        return callAI(`
            User mentioned 'Oron'. 
            Compliment him with 'big daddy' energy and dominance. 
            MAXIMUM 10 words.
        `);
    }

    // --- 4. GENERAL AI CHATBOT LOGIC ---
    if (message.mentions.has(client.user)) {
        try {
            await message.channel.sendTyping();
            const cleanPrompt = content.replace(/<@!?[0-9]+>/g, "").trim();
            if (!cleanPrompt) return message.reply("whaaat? say something.");

            const result = await model.generateContent(`${AGENT_PERSONA}\n\nUser: ${cleanPrompt}`);
            const response = result.response.text();
            message.reply(response.substring(0, 2000));
        } catch (error) {
            console.error("AI Error:", error);
            message.reply("my brain is fried... try again later (API Error)");
        }
    }
});

const TOKEN = process.env.DISCORD_TOKEN;
if (!TOKEN) {
    console.error("❌ Error: DISCORD_TOKEN is missing in Environment Variables!");
} else {
    client.login(TOKEN);
}
