const { Client, GatewayIntentBits, Collection, REST, Routes, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const express = require('express');

// =================================================================
// 1. EXPRESS SERVER SETUP
// =================================================================
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.status(200).send('Dual Discord Bot Service is running and responding to health checks.');
});

app.listen(port, () => {
    console.log(`🔄 Keep-alive server running on port ${port}`);
});

// =================================================================
// 2. CORE COMMAND DEFINITIONS 
// =================================================================

const allCommands = [
    { name: 'ban', description: 'Ban a member from the server', options: [{ name: 'user', type: 6, description: 'The user to ban', required: true }, { name: 'reason', type: 3, description: 'Reason for the ban', required: false }], default_member_permissions: PermissionFlagsBits.BanMembers.toString() },
    { name: 'unban', description: 'Unban a user from the server', options: [{ name: 'user_id', type: 3, description: 'The user ID to unban', required: true }, { name: 'reason', type: 3, description: 'Reason for the unban', required: false }], default_member_permissions: PermissionFlagsBits.BanMembers.toString() },
    { name: 'kick', description: 'Kick a member from the server', options: [{ name: 'user', type: 6, description: 'The user to kick', required: true }, { name: 'reason', type: 3, description: 'Reason for the kick', required: false }], default_member_permissions: PermissionFlagsBits.KickMembers.toString() },
    { name: 'mute', description: 'Mute a member in the server', options: [{ name: 'user', type: 6, description: 'The user to mute', required: true }, { name: 'duration', type: 4, description: 'Duration in minutes (default: 10)', required: false }, { name: 'reason', type: 3, description: 'Reason for the mute', required: false }], default_member_permissions: PermissionFlagsBits.ModerateMembers.toString() },
    { name: 'unmute', description: 'Unmute a member in the server', options: [{ name: 'user', type: 6, description: 'The user to unmute', required: true }, { name: 'reason', type: 3, description: 'Reason for the unmute', required: false }], default_member_permissions: PermissionFlagsBits.ModerateMembers.toString() }
];

// =================================================================
// 3. SEPARATED REPLY DICTIONARIES
// =================================================================

// ➡️ Bot 1's unique phrases: (Main Bot/Mod Bot)
const bot1MessageMap = {
    'hai': 'haii:3', 'hello': 'hellooo', 'aya': 'fat and retarded', 'oron': 'your daddy', 'fatran': 'airpor/10',
    'abbi': 'best kitten', 'soobie': 'soobins wife', 'yue': 'looking for a gf', 'randle': 'little omega', 'ethan': 'our bbg :3',
    'xu': 'queen', 'ping': 'pong!',
    'welcome': "**stay active & read <#1241372105694515290>** <a:d_004:1360082620733456544>\n" +
               "*/wony in status for pic perms !*", 
};
const bot2MessageMap = {
    'kata': '🐗', 'aeri': 'savs kitten', 'sav': 'aeris kitten', 'abbi': 'stfu',
};


// =================================================================
// 4. REUSABLE HANDLER FUNCTIONS
// =================================================================

const handleMessageReplies = (messageMap, message) => {
    if (message.author.bot) return;
    const content = message.content.toLowerCase().trim();
    
    for (const [trigger, reply] of Object.entries(messageMap)) {
        if (content.includes(trigger)) {
            message.channel.send(reply); 
            return; 
        }
    }
};

const handleSlashCommands = async (interaction, client) => {
    const { commandName, options, member, guild } = interaction;
    const botTag = client.user.tag;
    // ... (logic omitted for brevity) ...
};


// =================================================================
// 5. THE DUAL-BOT FACTORY
// =================================================================

// ⚙️ DEFINED CHANNEL IDs
const LOG_CHANNEL_ID = '1258112422674301070'; 
const WELCOME_CHANNEL_ID = '1275474726889717851'; 

// 🖼️ URL for the uploaded GIF (FINAL VERIFIED DIRECT LINK)
const WELCOME_GIF_URL = 'https://i.imgur.com/UVZMfjv.gif'; 

function createAndStartBot(tokenKey, botName, commandList, messageMap) {
    const TOKEN = process.env[tokenKey];
    if (!TOKEN) {
        console.error(`❌ Error: ${tokenKey} is missing in Environment Variables! Skipping ${botName}.`);
        return null;
    }

    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
            GatewayIntentBits.GuildMembers 
        ]
    });

    client.on('ready', async () => {
        console.log(`✅ ${botName} is online as ${client.user.tag}`);
        client.user.setActivity(`Monitoring as ${botName}`, { type: 'WATCHING' });

        const rest = new REST({ version: '10' }).setToken(TOKEN);

        try {
            console.log(`🔄 Registering slash commands for ${botName}...`);
            await rest.put(
                Routes.applicationCommands(client.user.id),
                { body: commandList }
            );
            console.log(`✅ Slash commands registered successfully for ${botName}!`);
        } catch (error) {
            console.error(`❌ Error registering commands for ${botName}:`, error);
        }
    });

    client.on('interactionCreate', async (interaction) => {
        if (!interaction.isChatInputCommand()) return;
        await handleSlashCommands(interaction, client);
    });

    client.on('messageCreate', (message) => {
        handleMessageReplies(messageMap, message);
    });
    
    // ⭐️ MEMBER JOIN LOG (WELCOME) - CUSTOM EMBED ⭐️
    client.on('guildMemberAdd', async (member) => {
        // Only Bot A runs this event
        if (botName !== "Bot A - Main Mod") return;

        try {
            const welcomeChannel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
            if (!welcomeChannel) {
                console.warn(`[${botName}] Welcome channel ID (${WELCOME_CHANNEL_ID}) not found.`);
                return;
            }

            // Construct the Embed message 
            const welcomeEmbed = new EmbedBuilder()
                .setColor(0x2F3136) 
                // Uses the final, verified direct GIF link
                .setThumbnail(WELCOME_GIF_URL) 
                
                .addFields({
                    // Uses the correct custom animated emoji ID.
                    value: `<a:e_003:1360082637292572785> **WELCOME** ${member.toString()}`,
                    name: '\u200B', // Invisible field name
                    inline: false,
                })
                // Add the footer
                .setFooter({ text: `${member.guild.memberCount}` }) 
                .setTimestamp();

            // Send the embed. content: null prevents the double mention.
            await welcomeChannel.send({ 
                content: null, 
                embeds: [welcomeEmbed] 
            });

        } catch (error) {
            console.error(`Error logging member join for ${botName}:`, error);
        }
    });

    // ⭐️ MEMBER LEAVE LOG (LEAVE) - PLAIN TEXT ⭐️
    client.on('guildMemberRemove', async (member) => {
        // Only Bot A runs this event
        if (botName !== "Bot A - Main Mod") return;

        try {
            const logChannel = member.guild.channels.cache.get(LOG_CHANNEL_ID);
            if (!logChannel) {
                console.warn(`[${botName}] Log channel ID (${LOG_CHANNEL_ID}) not found.`);
                return;
            }

            const logMessage = `👋 **${member.user.tag}** (${member.user.id}) has left the server.`;
            
            await logChannel.send(logMessage);
        } catch (error) {
            console.error(`Error logging member leave for ${botName}:`, error);
        }
    });

    client.login(TOKEN).catch(err => {
        console.error(`🚨 Failed to log into Discord for ${botName}:`, err);
    });

    return client;
}

// =================================================================
// 6. EXECUTION: START BOTH BOTS
// =================================================================

const bot1 = createAndStartBot(
    "DISCORD_TOKEN_1", 
    "Bot A - Main Mod", 
    allCommands,      
    bot1MessageMap     
);

const bot2 = createAndStartBot(
    "DISCORD_TOKEN_2", 
    "Bot B - Utility", 
    allCommands,      
    bot2MessageMap     
);

console.log("Two bot clients initialized in a single process. Check Render logs for status.");
