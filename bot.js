const { Client, GatewayIntentBits, Collection, REST, Routes, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const express = require('express');
<<<<<<< HEAD
const fs = require('fs/promises'); // For file system operations
const path = require('path');       // For file path resolution

// =================================================================
// 0. PERSISTENT STORAGE SETUP
// =================================================================

const CONFIG_FILE = path.resolve(__dirname, 'config.json');
let cachedConfig = {}; // Global cache for all server configurations

/**
 * Loads configurations (auto-responses, channels) from the JSON file.
 */
async function loadConfig() {
    try {
        const data = await fs.readFile(CONFIG_FILE, 'utf-8');
        cachedConfig = JSON.parse(data);
        console.log('✅ Configuration loaded from file.');
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log('📝 config.json not found, creating an empty one.');
            cachedConfig = {};
            await saveConfig();
        } else {
            console.error('❌ Error loading configuration:', error);
        }
    }
}

/**
 * Writes the current cache to the JSON file.
 */
async function saveConfig() {
    try {
        await fs.writeFile(CONFIG_FILE, JSON.stringify(cachedConfig, null, 4), 'utf-8');
    } catch (error) {
        console.error('❌ Error saving configuration:', error);
    }
}


// =================================================================
=======

// =================================================================
>>>>>>> e2c34e055d7cca9a4224cc94476a66c061c47cb7
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
<<<<<<< HEAD
// 2. CORE COMMAND DEFINITIONS
// =================================================================

const allCommands = [
    // --- Existing Moderation Commands ---
=======
// 2. CORE COMMAND DEFINITIONS 
// =================================================================

const allCommands = [
>>>>>>> e2c34e055d7cca9a4224cc94476a66c061c47cb7
    { name: 'ban', description: 'Ban a member from the server', options: [{ name: 'user', type: 6, description: 'The user to ban', required: true }, { name: 'reason', type: 3, description: 'Reason for the ban', required: false }], default_member_permissions: PermissionFlagsBits.BanMembers.toString() },
    { name: 'unban', description: 'Unban a user from the server', options: [{ name: 'user_id', type: 3, description: 'The user ID to unban', required: true }, { name: 'reason', type: 3, description: 'Reason for the unban', required: false }], default_member_permissions: PermissionFlagsBits.BanMembers.toString() },
    { name: 'kick', description: 'Kick a member from the server', options: [{ name: 'user', type: 6, description: 'The user to kick', required: true }, { name: 'reason', type: 3, description: 'Reason for the kick', required: false }], default_member_permissions: PermissionFlagsBits.KickMembers.toString() },
    { name: 'mute', description: 'Mute a member in the server', options: [{ name: 'user', type: 6, description: 'The user to mute', required: true }, { name: 'duration', type: 4, description: 'Duration in minutes (default: 10)', required: false }, { name: 'reason', type: 3, description: 'Reason for the mute', required: false }], default_member_permissions: PermissionFlagsBits.ModerateMembers.toString() },
<<<<<<< HEAD
    { name: 'unmute', description: 'Unmute a member in the server', options: [{ name: 'user', type: 6, description: 'The user to unmute', required: true }, { name: 'reason', type: 3, description: 'Reason for the unmute', required: false }], default_member_permissions: PermissionFlagsBits.ModerateMembers.toString() },

    // --- NEW: Editable Auto-Response Command ---
    {
        name: 'autoresponse',
        description: 'Manage the bot\'s custom auto-responses.',
        default_member_permissions: PermissionFlagsBits.ManageGuild.toString(),
        options: [
            {
                name: 'add', description: 'Add a new trigger and response.', type: 1, // Subcommand
                options: [
                    { name: 'trigger', type: 3, description: 'The word/phrase that triggers the response.', required: true },
                    { name: 'response', type: 3, description: 'The message the bot will reply with.', required: true },
                    { name: 'bot_tag', type: 3, description: 'Which bot to configure (Bot A or Bot B).', required: true, choices: [{ name: 'Bot A', value: 'Bot A' }, { name: 'Bot B', value: 'Bot B' }] },
                ],
            },
            {
                name: 'remove', description: 'Remove an existing auto-response by its trigger.', type: 1,
                options: [
                    { name: 'trigger', type: 3, description: 'The trigger word/phrase to remove.', required: true },
                    { name: 'bot_tag', type: 3, description: 'Which bot to configure (Bot A or Bot B).', required: true, choices: [{ name: 'Bot A', value: 'Bot A' }, { name: 'Bot B', value: 'Bot B' }] },
                ],
            },
            { name: 'list', description: 'List all currently configured auto-responses.', type: 1 },
        ],
    },

    // --- NEW: Editable Channel Settings Command ---
    {
        name: 'setchannel',
        description: 'Set custom channels for logs and welcome messages.',
        default_member_permissions: PermissionFlagsBits.ManageGuild.toString(),
        options: [
            {
                name: 'modlog', description: 'Set the channel for moderation logs.', type: 1,
                options: [{ name: 'channel', type: 7, description: 'The channel to use for mod logs.', required: true }],
            },
            {
                name: 'welcome', description: 'Set the channel for member welcome messages (Bot A only).', type: 1,
                options: [{ name: 'channel', type: 7, description: 'The channel to use for welcome messages.', required: true }],
            },
            {
                name: 'welcome_gif', description: 'Set the URL for the welcome GIF image (Bot A only).', type: 1,
                options: [{ name: 'url', type: 3, description: 'The direct URL of the GIF image.', required: true }],
            }
        ],
    },
=======
    { name: 'unmute', description: 'Unmute a member in the server', options: [{ name: 'user', type: 6, description: 'The user to unmute', required: true }, { name: 'reason', type: 3, description: 'Reason for the unmute', required: false }], default_member_permissions: PermissionFlagsBits.ModerateMembers.toString() }
>>>>>>> e2c34e055d7cca9a4224cc94476a66c061c47cb7
];

// =================================================================
// 3. REUSABLE HANDLER FUNCTIONS
// =================================================================

<<<<<<< HEAD
/**
 * Handles message replies using the dynamic, per-server cachedConfig.
 */
const handleMessageReplies = (botName, message) => {
    // If the message is from a bot or in a DM, ignore it
    if (message.author.bot || !message.guild) return;

=======
const bot1MessageMap = {
    'hai': 'haii:3', 'hello': 'hellooo', 'aya': 'fat and retarded', 'oron': 'your daddy', 'fatran': 'airpor/10',
    'abbi': 'best kitten', 'soobie': 'soobins wife', 'yue': 'looking for a gf', 'randle': 'little omega', 'ethan': 'our bbg :3',
    'xu': 'queen', 'ping': 'pong!', 'abi': 'best beta',
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
>>>>>>> e2c34e055d7cca9a4224cc94476a66c061c47cb7
    const content = message.content.toLowerCase().trim();
    const guildId = message.guild.id;

    // Retrieve configuration for the specific guild
    const guildResponses = cachedConfig[guildId]?.autoResponses;
    if (!guildResponses) return;

    // Get the responses map for the specific bot (Bot A or Bot B)
    const messageMap = guildResponses[botName];
    if (!messageMap) return;

    // Look for a trigger match
    for (const [trigger, reply] of Object.entries(messageMap)) {
        if (content.includes(trigger)) {
<<<<<<< HEAD
            message.channel.send(reply);
            return;
=======
            message.channel.send(reply); 
            return; 
>>>>>>> e2c34e055d7cca9a4224cc94476a66c061c47cb7
        }
    }
};


/**
 * Handles all Slash Commands, including new config commands.
 */
const handleSlashCommands = async (interaction, client) => {
    const { commandName, options, member, guild } = interaction;
    const botTag = client.user.tag;
<<<<<<< HEAD
    const guildId = guild.id;

    // Ensure guild configuration exists for this server
    cachedConfig[guildId] = cachedConfig[guildId] || { autoResponses: { 'Bot A': {}, 'Bot B': {} } };
    const guildConfig = cachedConfig[guildId];
    const autoResponses = guildConfig.autoResponses;

    await interaction.deferReply({ ephemeral: false }).catch(console.error);
=======
    
    // Defer reply immediately to prevent Discord timeout (3 seconds)
    await interaction.deferReply({ ephemeral: false }).catch(console.error); 
>>>>>>> e2c34e055d7cca9a4224cc94476a66c061c47cb7

    try {
        // --- AUTO-RESPONSE COMMAND LOGIC ---
        if (commandName === 'autoresponse') {
            if (!member.permissions.has(PermissionFlagsBits.ManageGuild)) {
                return await interaction.editReply({ content: '❌ You need the `Manage Server` permission to manage auto-responses.', ephemeral: true });
            }

            const subcommand = options.getSubcommand();
            // Fallback for bot tag if somehow not provided (though required in command def)
            const botConfigTag = options.getString('bot_tag') || (client.user.tag.includes('Main Mod') ? 'Bot A' : 'Bot B');

            if (subcommand === 'add') {
                const trigger = options.getString('trigger').toLowerCase().trim();
                const response = options.getString('response').trim();

                autoResponses[botConfigTag][trigger] = response;
                await saveConfig();

                await interaction.editReply(`✅ Successfully set a new auto-response for **${botConfigTag}**: \n\n**Trigger:** \`${trigger}\`\n**Response:** \`${response.substring(0, 50)}...\``);

            } else if (subcommand === 'remove') {
                const trigger = options.getString('trigger').toLowerCase().trim();

                if (!autoResponses[botConfigTag][trigger]) {
                    return await interaction.editReply({ content: `❌ The trigger \`${trigger}\` was not found for **${botConfigTag}**.`, ephemeral: true });
                }

                delete autoResponses[botConfigTag][trigger];
                await saveConfig();

                await interaction.editReply(`✅ Successfully removed the auto-response with trigger: \`${trigger}\` for **${botConfigTag}**.`);

            } else if (subcommand === 'list') {
                let listOutput = `## 📝 Auto-Responses for ${guild.name}\n\n`;

                const botAList = Object.entries(autoResponses['Bot A'] || {});
                listOutput += `**Bot A Responses (${botAList.length}):**\n`;
                listOutput += botAList.length > 0 ? botAList.map(([t, r]) => `> \`${t}\` -> \`${r.substring(0, 30)}...\``).join('\n') : '> *None configured.*\n';

                const botBList = Object.entries(autoResponses['Bot B'] || {});
                listOutput += `\n**Bot B Responses (${botBList.length}):**\n`;
                listOutput += botBList.length > 0 ? botBList.map(([t, r]) => `> \`${t}\` -> \`${r.substring(0, 30)}...\``).join('\n') : '> *None configured.*\n';

                await interaction.editReply({ content: listOutput, ephemeral: true });
            }
            return;
        }

        // --- SET CHANNEL COMMAND LOGIC ---
        if (commandName === 'setchannel') {
            if (!member.permissions.has(PermissionFlagsBits.ManageGuild)) {
                return await interaction.editReply({ content: '❌ You need the `Manage Server` permission to configure channels.', ephemeral: true });
            }
            
            const subcommand = options.getSubcommand();

            if (subcommand === 'modlog') {
                const channel = options.getChannel('channel');
                guildConfig.modLogChannelId = channel.id;
                await saveConfig();
                await interaction.editReply(`✅ Moderation log channel set to: ${channel}`);
            } else if (subcommand === 'welcome') {
                const channel = options.getChannel('channel');
                guildConfig.welcomeChannelId = channel.id;
                await saveConfig();
                await interaction.editReply(`✅ Welcome channel set to: ${channel} (Bot A only).`);
            } else if (subcommand === 'welcome_gif') {
                const url = options.getString('url');
                if (!url.match(/\.(gif|png|jpg|jpeg|webp)$/i)) {
                    return await interaction.editReply({ content: '❌ The URL must be a direct link to an image/GIF.', ephemeral: true });
                }
                guildConfig.welcomeGifUrl = url;
                await saveConfig();
                await interaction.editReply(`✅ Welcome GIF URL set successfully to: \`${url}\` (Bot A only).`);
            }
            return;
        }
        
        // --- Existing Moderation Logic (Keep this section from your original code) ---
        if (commandName === 'ban') {
<<<<<<< HEAD
             const user = options.getUser('user');
             const reason = options.getString('reason') || 'No reason provided';
             if (!member.permissions.has(PermissionFlagsBits.BanMembers)) {
                 return await interaction.editReply({ content: '❌ You do not have permission to ban members.', ephemeral: true });
             }
             if (!guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) {
                 return await interaction.editReply({ content: `❌ I (${botTag}) do not have permission to ban members. Please check my role permissions.`, ephemeral: true });
             }
             const targetMember = guild.members.cache.get(user.id);
             if (!targetMember || !targetMember.bannable) {
                 return await interaction.editReply({ content: '❌ I cannot ban this user. They might have higher permissions.', ephemeral: true });
             }
             await targetMember.ban({ reason });
             await interaction.editReply(`✅ Successfully banned **${user.tag}** using ${botTag}. Reason: ${reason}`);

        } else if (commandName === 'unban') {
             const userId = options.getString('user_id');
             const reason = options.getString('reason') || 'No reason provided';
             if (!member.permissions.has(PermissionFlagsBits.BanMembers)) {
                 return await interaction.editReply({ content: '❌ You do not have permission to unban members.', ephemeral: true });
             }
             if (!guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) {
                 return await interaction.editReply({ content: `❌ I (${botTag}) do not have permission to unban members. Please check my role permissions.`, ephemeral: true });
             }
             try {
                 if (!/^\d{17,20}$/.test(userId)) {
                     return await interaction.editReply({ content: '❌ Invalid user ID format. Please provide a valid Discord user ID.', ephemeral: true });
                 }
                 await guild.bans.fetch(userId);
                 await guild.members.unban(userId, reason);
                 await interaction.editReply(`✅ Successfully unbanned user with ID: **${userId}** using ${botTag}. Reason: ${reason}`);
             } catch (error) {
                 const errorContent = (error.code === 10026) ? '❌ This user is not banned.' : '❌ There was an error unbanning this user.';
                 await interaction.editReply({ content: errorContent, ephemeral: true });
             }

        } else if (commandName === 'kick') {
             const user = options.getUser('user');
             const reason = options.getString('reason') || 'No reason provided';
             if (!member.permissions.has(PermissionFlagsBits.KickMembers)) {
                 return await interaction.editReply({ content: '❌ You do not have permission to kick members.', ephemeral: true });
             }
             if (!guild.members.me.permissions.has(PermissionFlagsBits.KickMembers)) {
                 return await interaction.editReply({ content: `❌ I (${botTag}) do not have permission to kick members. Please check my role permissions.`, ephemeral: true });
             }
             const targetMember = guild.members.cache.get(user.id);
             if (!targetMember || !targetMember.kickable) {
                 return await interaction.editReply({ content: '❌ I cannot kick this user. They might have higher permissions.', ephemeral: true });
             }
             await targetMember.kick(reason);
             await interaction.editReply(`✅ Successfully kicked **${user.tag}** using ${botTag}. Reason: ${reason}`);

        } else if (commandName === 'mute') {
             const user = options.getUser('user');
             const duration = options.getInteger('duration') || 10;
             const reason = options.getString('reason') || 'No reason provided';
             if (!member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
                 return await interaction.editReply({ content: '❌ You do not have permission to mute members.', ephemeral: true });
             }
             if (!guild.members.me.permissions.has(PermissionFlagsBits.ModerateMembers)) {
                 return await interaction.editReply({ content: `❌ I (${botTag}) do not have permission to mute members. Please check my role permissions.`, ephemeral: true });
             }
             const targetMember = guild.members.cache.get(user.id);
             if (!targetMember || !targetMember.moderatable) {
                 return await interaction.editReply({ content: '❌ I cannot mute this user. They might have higher permissions.', ephemeral: true });
             }
             const durationMs = duration * 60 * 1000;
             if (durationMs > 28 * 24 * 60 * 60 * 1000) {
                 return await interaction.editReply({ content: '❌ Mute duration cannot exceed 28 days.', ephemeral: true });
             }
             await targetMember.timeout(durationMs, reason);
             let durationText = duration === 1 ? '1 minute' : `${duration} minutes`;
             await interaction.editReply(`✅ Successfully muted **${user.tag}** for ${durationText} using ${botTag}. Reason: ${reason}`);

        } else if (commandName === 'unmute') {
             const user = options.getUser('user');
             const reason = options.getString('reason') || 'No reason provided';
             if (!member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
                 return await interaction.editReply({ content: '❌ You do not have permission to unmute members.', ephemeral: true });
             }
             if (!guild.members.me.permissions.has(PermissionFlagsBits.ModerateMembers)) {
                 return await interaction.editReply({ content: `❌ I (${botTag}) do not have permission to unmute members. Please check my role permissions.`, ephemeral: true });
             }
             const targetMember = guild.members.cache.get(user.id);
             if (!targetMember || !targetMember.moderatable) {
                 return await interaction.editReply({ content: '❌ I cannot unmute this user. They might have higher permissions.', ephemeral: true });
             }
             if (!targetMember.isCommunicationDisabled()) {
                 return await interaction.editReply({ content: '❌ This user is not muted.', ephemeral: true });
             }
             await targetMember.timeout(null, reason);
             await interaction.editReply(`✅ Successfully unmuted **${user.tag}** using ${botTag}. Reason: ${reason}`);
=======
            const user = options.getUser('user');
            const reason = options.getString('reason') || 'No reason provided';
            if (!member.permissions.has(PermissionFlagsBits.BanMembers)) {
                return await interaction.editReply({ content: '❌ You do not have permission to ban members.', ephemeral: true });
            }
            if (!guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) {
                return await interaction.editReply({ content: `❌ I (${botTag}) do not have permission to ban members. Please check my role permissions.`, ephemeral: true });
            }
            const targetMember = guild.members.cache.get(user.id);
            if (!targetMember || !targetMember.bannable) {
                return await interaction.editReply({ content: '❌ I cannot ban this user. They might have higher permissions.', ephemeral: true });
            }
            await targetMember.ban({ reason });
            await interaction.editReply(`✅ Successfully banned **${user.tag}** using ${botTag}. Reason: ${reason}`);

        } else if (commandName === 'unban') {
            const userId = options.getString('user_id');
            const reason = options.getString('reason') || 'No reason provided';
            if (!member.permissions.has(PermissionFlagsBits.BanMembers)) {
                return await interaction.editReply({ content: '❌ You do not have permission to unban members.', ephemeral: true });
            }
            if (!guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) {
                return await interaction.editReply({ content: `❌ I (${botTag}) do not have permission to unban members. Please check my role permissions.`, ephemeral: true });
            }
            try {
                if (!/^\d{17,20}$/.test(userId)) {
                    return await interaction.editReply({ content: '❌ Invalid user ID format. Please provide a valid Discord user ID.', ephemeral: true });
                }
                await guild.bans.fetch(userId);
                await guild.members.unban(userId, reason);
                await interaction.editReply(`✅ Successfully unbanned user with ID: **${userId}** using ${botTag}. Reason: ${reason}`);
            } catch (error) {
                const errorContent = (error.code === 10026) ? '❌ This user is not banned.' : '❌ There was an error unbanning this user.';
                await interaction.editReply({ content: errorContent, ephemeral: true });
            }

        } else if (commandName === 'kick') {
            const user = options.getUser('user');
            const reason = options.getString('reason') || 'No reason provided';
            if (!member.permissions.has(PermissionFlagsBits.KickMembers)) {
                return await interaction.editReply({ content: '❌ You do not have permission to kick members.', ephemeral: true });
            }
            if (!guild.members.me.permissions.has(PermissionFlagsBits.KickMembers)) {
                return await interaction.editReply({ content: `❌ I (${botTag}) do not have permission to kick members. Please check my role permissions.`, ephemeral: true });
            }
            const targetMember = guild.members.cache.get(user.id);
            if (!targetMember || !targetMember.kickable) {
                return await interaction.editReply({ content: '❌ I cannot kick this user. They might have higher permissions.', ephemeral: true });
            }
            await targetMember.kick(reason);
            await interaction.editReply(`✅ Successfully kicked **${user.tag}** using ${botTag}. Reason: ${reason}`);

        } else if (commandName === 'mute') {
            const user = options.getUser('user');
            const duration = options.getInteger('duration') || 10;
            const reason = options.getString('reason') || 'No reason provided';
            if (!member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
                return await interaction.editReply({ content: '❌ You do not have permission to mute members.', ephemeral: true });
            }
            if (!guild.members.me.permissions.has(PermissionFlagsBits.ModerateMembers)) {
                return await interaction.editReply({ content: `❌ I (${botTag}) do not have permission to mute members. Please check my role permissions.`, ephemeral: true });
            }
            const targetMember = guild.members.cache.get(user.id);
            if (!targetMember || !targetMember.moderatable) {
                return await interaction.editReply({ content: '❌ I cannot mute this user. They might have higher permissions.', ephemeral: true });
            }
            const durationMs = duration * 60 * 1000;
            if (durationMs > 28 * 24 * 60 * 60 * 1000) {
                return await interaction.editReply({ content: '❌ Mute duration cannot exceed 28 days.', ephemeral: true });
            }
            await targetMember.timeout(durationMs, reason);
            let durationText = duration === 1 ? '1 minute' : `${duration} minutes`;
            await interaction.editReply(`✅ Successfully muted **${user.tag}** for ${durationText} using ${botTag}. Reason: ${reason}`);

        } else if (commandName === 'unmute') {
            const user = options.getUser('user');
            const reason = options.getString('reason') || 'No reason provided';
            if (!member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
                return await interaction.editReply({ content: '❌ You do not have permission to unmute members.', ephemeral: true });
            }
            if (!guild.members.me.permissions.has(PermissionFlagsBits.ModerateMembers)) {
                return await interaction.editReply({ content: `❌ I (${botTag}) do not have permission to unmute members. Please check my role permissions.`, ephemeral: true });
            }
            const targetMember = guild.members.cache.get(user.id);
            if (!targetMember || !targetMember.moderatable) {
                return await interaction.editReply({ content: '❌ I cannot unmute this user. They might have higher permissions.', ephemeral: true });
            }
            if (!targetMember.isCommunicationDisabled()) {
                return await interaction.editReply({ content: '❌ This user is not muted.', ephemeral: true });
            }
            await targetMember.timeout(null, reason);
            await interaction.editReply(`✅ Successfully unmuted **${user.tag}** using ${botTag}. Reason: ${reason}`);
>>>>>>> e2c34e055d7cca9a4224cc94476a66c061c47cb7
        }


    } catch (error) {
        console.error(`Error executing command on ${botTag}:`, error);
        if (interaction.deferred || interaction.replied) {
            await interaction.editReply({ content: `❌ There was an unexpected error executing this command on ${botTag}.`, ephemeral: true });
        } else {
            await interaction.reply({ content: `❌ There was an unexpected error executing this command on ${botTag}.`, ephemeral: true });
        }
    }
};


// =================================================================
// 4. THE DUAL-BOT FACTORY
// =================================================================

<<<<<<< HEAD
function createAndStartBot(tokenKey, botName, commandList) {
=======
// ⚙️ DEFINED CHANNEL IDs
const LOG_CHANNEL_ID = '1258112422674301070'; 
const WELCOME_CHANNEL_ID = '1275474726889717851'; 

// 🖼️ URL for the uploaded GIF (FINAL VERIFIED DIRECT LINK)
const WELCOME_GIF_URL = 'https://i.imgur.com/UVZMfjv.gif'; 

function createAndStartBot(tokenKey, botName, commandList, messageMap) {
>>>>>>> e2c34e055d7cca9a4224cc94476a66c061c47cb7
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

    // Uses the dynamic handler
    client.on('messageCreate', (message) => {
        handleMessageReplies(botName, message);
    });
<<<<<<< HEAD


    // ⭐️ MEMBER JOIN LOG (WELCOME) - USES DYNAMIC CONFIG ⭐️
    client.on('guildMemberAdd', async (member) => {
        if (botName !== "Bot A") return; // Only Bot A runs this event

        try {
            const guildConfig = cachedConfig[member.guild.id];
            if (!guildConfig || !guildConfig.welcomeChannelId) return;

            const welcomeChannel = member.guild.channels.cache.get(guildConfig.welcomeChannelId);
            const welcomeGifUrl = guildConfig.welcomeGifUrl; 

            if (!welcomeChannel) {
                console.warn(`[${botName}] Welcome channel ID (${guildConfig.welcomeChannelId}) not found.`);
                return;
            }

            const welcomeEmbed = new EmbedBuilder()
                .setColor(0x2F3136)
                .addFields({
                    value: `<a:e_003:1360082637292572785> **WELCOME** ${member.toString()}`,
                    name: '\u200B',
                    inline: false,
                })
                .setFooter({ text: `${member.guild.memberCount}` })
                .setTimestamp();
            
            // 👇 FIXED: Conditional logic moved outside the chain
            if (welcomeGifUrl) {
                welcomeEmbed.setThumbnail(welcomeGifUrl);
            }

            await welcomeChannel.send({
                content: null,
                embeds: [welcomeEmbed]
=======
    
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
>>>>>>> e2c34e055d7cca9a4224cc94476a66c061c47cb7
            });

        } catch (error) {
            console.error(`Error logging member join for ${botName}:`, error);
        }
    });

<<<<<<< HEAD
    // ⭐️ MEMBER LEAVE LOG (LEAVE) - USES DYNAMIC CONFIG ⭐️
    client.on('guildMemberRemove', async (member) => {
        if (botName !== "Bot A") return; // Only Bot A runs this event

        try {
            const guildConfig = cachedConfig[member.guild.id];
            if (!guildConfig || !guildConfig.modLogChannelId) return; // Use ModLog for leave messages

            const logChannel = member.guild.channels.cache.get(guildConfig.modLogChannelId);

            if (!logChannel) {
                console.warn(`[${botName}] Log channel ID (${guildConfig.modLogChannelId}) not found.`);
                return;
            }

            // Using the static leave message text
            const logMessage = `${member.toString()} just ate a dih`;

=======
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

            // 👇 FINAL CORRECTED LEAVE MESSAGE: Uses member.toString() to generate a clickable @mention
            const logMessage = `${member.toString()} just ate a dih`;
            
>>>>>>> e2c34e055d7cca9a4224cc94476a66c061c47cb7
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
// 5. EXECUTION: START BOTH BOTS (ASYNC WRAPPER)
// =================================================================

<<<<<<< HEAD
async function startBots() {
    await loadConfig(); // Load all data before connecting to Discord

    const bot1 = createAndStartBot(
        "DISCORD_TOKEN_1",
        "Bot A",
        allCommands
    );
=======
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
>>>>>>> e2c34e055d7cca9a4224cc94476a66c061c47cb7

    const bot2 = createAndStartBot(
        "DISCORD_TOKEN_2",
        "Bot B",
        allCommands
    );

    console.log("Two bot clients initialized in a single process.");
}

startBots(); // Run the main async function