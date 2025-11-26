const { Client, GatewayIntentBits } = require('discord.js');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const express = require('express');

// --- 1. ENVIRONMENT & CONFIGURATION ---

// Set up Express for Render's required health check
const app = express();
// Use the port provided by the hosting environment (Render) or default to 3000
const port = process.env.PORT || 3000;

// Function to safely retrieve the API key
function getAIKey() {
    const aiKey = process.env.GEMINI_API_KEY;
    if (!aiKey) {
        console.error("❌ FATAL: GEMINI_API_KEY environment variable is missing.");
        process.exit(1); // Exit process if the crucial key is missing
    }
    return aiKey;
}

// --- 2. AI CLIENT SETUP ---

const aiKey = getAIKey();

// Define the bot's persona (system instruction)
const AGENT_PERSONA = `
You are a discord bot named Abbi. 
You are sarcastic, funny, and slightly chaotic. 
You love cats and you hate water.
You reply in a casual internet style, sometimes using lowercase.
If someone is rude, roast them gently.
`;

const genAI = new GoogleGenerativeAI(aiKey);

// FIX 1: The systemInstruction is now a direct property of the model configuration object.
const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: AGENT_PERSONA, // <-- Correct location for system instruction
});

// --- 3. DISCORD CLIENT SETUP ---

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Helper function to call AI with specific short prompts (for character triggers)
const callAI = async (message, prompt, triggerName) => {
    try {
        await message.channel.sendTyping();

        // FIX 2: Generation parameters like 'temperature' must be nested under 
        // a 'generationConfig' object in the generateContent payload.
        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: { // <-- ADDED: The required wrapper for generation parameters
                temperature: 0.9,
            },
        });

        const response = result.response.text.trim();
        if (response) {
            // Discord message limit is 2000 characters
            message.reply(response.substring(0, 2000));
        }
    } catch (error) {
        console.error(`AI Error for ${triggerName}:`, error);
        // Respond gracefully on failure
        message.reply(`ugh, i tried talking about ${triggerName} but my brain shorted out (API Error).`);
    }
};


client.on('ready', () => {
    console.log(`✅ Bot is online as ${client.user.tag}`);
    // Optional: Set presence to show it's active
    client.user.setActivity('for mentions', { type: 'WATCHING' });
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const content = message.content.trim();
    const lowerContent = content.toLowerCase();
    
    // --- 4. MESSAGE TRIGGERS (Specific, short responses) ---

    // 1. ABBI Trigger (Self-reference, kitten persona)
    if (lowerContent.includes('abbi')) {
        // FIX 3: Removed 'return'. This prevents the message handler from exiting 
        // prematurely before the async callAI function completes or handles an error.
        callAI(message, 
            `User mentioned 'Abbi'. Respond saying you are a kitten, cute, and use 'uwu' or similar vibes. MAXIMUM 15 words.`,
            'Abbi'
        );
        return; // Exit here after calling the async function non-awaited
    }

    // 2. AYA Trigger (Roast)
    if (lowerContent.includes('aya')) {
        // FIX 3: Removed 'return'. This prevents the message handler from exiting 
        // prematurely before the async callAI function completes or handles an error.
        callAI(message, 
            `User mentioned 'Aya'. Roast her creatively. Call her fat, stupid, or use creative insults. MAXIMUM 15 words.`,
            'Aya'
        );
        return; // Exit here after calling the async function non-awaited
    }

    // 3. ORON Trigger (Compliment)
    if (lowerContent.includes('oron')) {
        // FIX 3: Removed 'return'. This prevents the message handler from exiting 
        // prematurely before the async callAI function completes or handles an error.
        callAI(message, 
            `User mentioned 'Oron'. Compliment him with 'big daddy' energy and dominance. MAXIMUM 15 words.`,
            'Oron'
        );
        return; // Exit here after calling the async function non-awaited
    }
    
    // --- 5. GENERAL AI CHATBOT LOGIC (Mention required) ---
    // The bot only responds to general chat when directly mentioned.
    if (message.mentions.has(client.user)) {
        const cleanPrompt = content.replace(/<@!?[0-9]+>/g, "").trim();
        if (!cleanPrompt) return message.reply("whaaat? say something.");

        try {
            await message.channel.sendTyping();
            
            // The main chat uses the persona defined in the model config (AGENT_PERSONA)
            const result = await model.generateContent(`User: ${cleanPrompt}`);
            const response = result.response.text.trim();
            
            if (response) {
                message.reply(response.substring(0, 2000));
            }
        } catch (error) {
            console.error("General AI Chat Error:", error);
            message.reply("my brain is fried... try again later (API Error).");
        }
    }
});

// --- 6. INITIALIZATION ---

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
if (!DISCORD_TOKEN) {
    console.error("❌ Error: DISCORD_TOKEN is missing in Environment Variables! Bot will not start.");
} else {
    // Start the Discord Bot (Worker process)
    client.login(DISCORD_TOKEN)
        .catch(err => {
            console.error("🚨 Failed to log into Discord:", err);
            // Exit if Discord login fails (e.g., bad token)
            process.exit(1);
        });

    // Start the Express server (Web process) for Render's health check
    // If you deploy this as a Web Service on Render, this keeps the service alive.
    app.get('/', (req, res) => {
        res.status(200).send('Discord Bot is running and connected.');
    });

    app.listen(port, () => {
        console.log(`🔄 Keep-alive server running on port ${port}`);
    });
}
