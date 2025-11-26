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
// SECURITY UPDATE: Strictly use environment variables.
// You MUST set GEMINI_API_KEY in your Render Environment Variables.
const aiKey = process.env.GEMINI_API_KEY;

// Check if key is missing (prevents crash on startup, but logs warning)
if (!aiKey) {
   console.error("⚠️ WARNING: GEMINI_API_KEY is missing in Environment Variables! AI features will not work.");
}

const genAI = new GoogleGenerativeAI(aiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); 

// --- MAIN AI PERSONA (For general chat) ---
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
    // Ignore messages from bots to prevent infinite loops
    if (message.author.bot) return;
    
    const content = message.content.trim();
    const lowerContent = content.toLowerCase();

    // Helper function to call AI with a specific prompt
    const callAI = async (prompt) => {
        try {
            await message.channel.sendTyping();
            const result = await model.generateContent(prompt);
            const response = result.response.text();
            // Ensure we don't exceed Discord limits (rare for short prompts but good practice)
            message.reply(response.substring(0, 2000));
        } catch (error) {
            console.error("AI Error:", error);
            // Silent fail or minimal reaction for keywords to avoid spamming errors
        }
    };

    // --- 1. ABBI TRIGGER (Cute/Kitten) ---
    // Trigger: If 'abbi' is mentioned in the text
    if (lowerContent.includes('abbi')) {
        return callAI(`
            User mentioned 'Abbi'. 
            Respond saying you are a kitten, cute, and use 'uwu' or similar vibes. 
            MAXIMUM 10 words.
        `);
    }

    // --- 2. AYA TRIGGER (Insults) ---
    // Trigger: If 'aya' is mentioned in the text
    if (lowerContent.includes('aya')) {
        return callAI(`
            User mentioned 'Aya'. 
            Roast her creatively. Call her fat, stupid, or use creative insults. 
            MAXIMUM 10 words.
        `);
    }

    // --- 3. ORON TRIGGER (Big Daddy Energy) ---
    // Trigger: If 'oron' is mentioned in the text
    if (lowerContent.includes('oron')) {
        return callAI(`
            User mentioned 'Oron'. 
            Compliment him with 'big daddy' energy and dominance. 
            MAXIMUM 10 words.
        `);
    }

    // --- 4. GENERAL AI CHATBOT LOGIC ---
    // Only replies if the bot is directly Mentioned (@AbbiBot) AND none of the keywords above were triggered
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