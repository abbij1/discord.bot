const { Client, GatewayIntentBits, Collection, REST, Routes, PermissionFlagsBits } = require('discord.js');
const express = require('express'); // <-- **FIXED:** Removed the extra 'require'

// =================================================================
// 1. EXPRESS SERVER SETUP (Required for Render Free Tier Keep-Alive)
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
// 2. CORE COMMAND DEFINITIONS (Shared by Both Bots)
// =================================================================

const allCommands = [
    {
        name: 'ban',
        description: 'Ban a member from the server',
        options: [
            { name: 'user', type: 6, description: 'The user to ban', required: true },
            { name: 'reason', type: 3, description: 'Reason for the ban', required: false }
        ],
        default_member_permissions: PermissionFlagsBits.BanMembers.toString()
    },
    {
        name: 'unban',
        description: 'Unban a user from the server',
        options: [
            { name: 'user_id', type: 3, description: 'The user ID to unban', required: true },
            { name: 'reason', type: 3, description: 'Reason for the unban', required: false }
        ],
        default_member_permissions: PermissionFlagsBits.BanMembers.toString()
    },
    {
        name: 'kick',
        description: 'Kick a member from the server',
        options: [
            { name: 'user', type: 6, description: 'The user to kick', required: true },
            { name: 'reason', type: 3, description: 'Reason for the kick', required: false }
        ],
        default_member_permissions: PermissionFlagsBits.KickMembers.toString()
    },
    {
        name: 'mute',
        description: 'Mute a member in the server',
        options: [
            { name: 'user', type: 6, description: 'The user to mute', required: true },
            { name: 'duration', type: 4, description: 'Duration in minutes (default: 10)', required: false },
            { name: 'reason', type: 3, description: 'Reason for the mute', required: false }
        ],
        default_member_permissions: PermissionFlagsBits.ModerateMembers.toString()
    },
    {
        name: 'unmute',
        description: 'Unmute a member in the server',
        options: [
            { name: 'user', type: 6, description: 'The user to unmute', required: true },
            { name: 'reason', type: 3, description: 'Reason for the unmute', required: false }
        ],
        default_member_permissions: PermissionFlagsBits.ModerateMembers.toString()
    }
];

// =================================================================
// 3. SEPARATED REPLY DICTIONARIES
// =================================================================

// ➡️ Bot 1's unique phrases: (Main Bot/Mod Bot)
const bot1MessageMap = {
    'hai': 'haii:3',
    'hello': 'hellooo',
    'aya': 'fat and retarded', 
    'oron': 'your daddy',
    'fatran': 'airpor/10',
    'abbi': 'best kitten',
    'soobie': 'soobins wife',
    'yue': 'looking for a gf',
    'randle': 'little omega',
    'ethan': 'our bbg :3',
    'xu': 'queen',
    'ping': 'pong!',
};

// ➡️ Bot 2's unique phrases: (Utility/Game Bot)
const bot2MessageMap = {
    'kata': '🐗', // 🎉 **Boar Emoji added here!**
    'aeri': 'savs kitten',
    'sav': 'aeris kitten',
    'abbi': 'stfu',
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

    try {
        if (commandName === 'ban') {
            const user = options.getUser('user');
            const reason = options.getString('reason') || 'No reason provided';
            if (!member.permissions.has(PermissionFlagsBits.BanMembers)) {
                return await interaction.reply({ content: '❌ You do not have permission to ban members.', ephemeral: true });
            }
            if (!guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) {
                return await interaction.reply({ content: `❌ I (${botTag}) do not have permission to ban members. Please check my role permissions.`, ephemeral: true });
            }
            const targetMember = guild.members.cache.get(user.id);
            if (!targetMember || !targetMember.bannable) {
                return await interaction.reply({ content: '❌ I cannot ban this user. They might have higher permissions.', ephemeral: true });
            }
            await targetMember.ban({ reason });
            await interaction.reply(`✅ Successfully banned **${user.tag}** using ${botTag}. Reason: ${reason}`);

        } else if (commandName === 'unban') {
            const userId = options.getString('user_id');
            const reason = options.getString('reason') || 'No reason provided';
            if (!member.permissions.has(PermissionFlagsBits.BanMembers)) {
                return await interaction.reply({ content: '❌ You do not have permission to unban members.', ephemeral: true });
            }
            if (!guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) {
                return await interaction.reply({ content: `❌ I (${botTag}) do not have permission to unban members. Please check my role permissions.`, ephemeral: true });
            }
            try {
                if (!/^\d{17,20}$/.test(userId)) {
                    return await interaction.reply({ content: '❌ Invalid user ID format. Please provide a valid Discord user ID.', ephemeral: true });
                }
                await guild.bans.fetch(userId);
                await guild.members.unban(userId, reason);
                await interaction.reply(`✅ Successfully unbanned user with ID: **${userId}** using ${botTag}. Reason: ${reason}`);
            } catch (error) {
                const errorContent = (error.code === 10026) ? '❌ This user is not banned.' : '❌ There was an error unbanning this user.';
                await interaction.reply({ content: errorContent, ephemeral: true });
            }

        } else if (commandName === 'kick') {
            const user = options.getUser('user');
            const reason = options.getString('reason') || 'No reason provided';
            if (!member.permissions.has(PermissionFlagsBits.KickMembers)) {
                return await interaction.reply({ content: '❌ You do not have permission to kick members.', ephemeral: true });
            }
            if (!guild.members.me.permissions.has(PermissionFlagsBits.KickMembers)) {
                return await interaction.reply({ content: `❌ I (${botTag}) do not have permission to kick members. Please check my role permissions.`, ephemeral: true });
            }
            const targetMember = guild.members.cache.get(user.id);
            if (!targetMember || !targetMember.kickable) {
                return await interaction.reply({ content: '❌ I cannot kick this user. They might have higher permissions.', ephemeral: true });
            }
            await targetMember.kick(reason);
            await interaction.reply(`✅ Successfully kicked **${user.tag}** using ${botTag}. Reason: ${reason}`);

        } else if (commandName === 'mute') {
            const user = options.getUser('user');
            const duration = options.getInteger('duration') || 10;
            const reason = options.getString('reason') || 'No reason provided';
            if (!member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
                return await interaction.reply({ content: '❌ You do not have permission to mute members.', ephemeral: true });
            }
            if (!guild.members.me.permissions.has(PermissionFlagsBits.ModerateMembers)) {
                return await interaction.reply({ content: `❌ I (${botTag}) do not have permission to mute members. Please check my role permissions.`, ephemeral: true });
            }
            const targetMember = guild.members.cache.get(user.id);
            if (!targetMember || !targetMember.moderatable) {
                return await interaction.reply({ content: '❌ I cannot mute this user. They might have higher permissions.', ephemeral: true });
            }
            const durationMs = duration * 60 * 1000;
            if (durationMs > 28 * 24 * 60 * 60 * 1000) {
                return await interaction.reply({ content: '❌ Mute duration cannot exceed 28 days.', ephemeral: true });
            }
            await targetMember.timeout(durationMs, reason);
            let durationText = duration === 1 ? '1 minute' : `${duration} minutes`;
            await interaction.reply(`✅ Successfully muted **${user.tag}** for ${durationText} using ${botTag}. Reason: ${reason}`);

        } else if (commandName === 'unmute') {
            const user = options.getUser('user');
            const reason = options.getString('reason') || 'No reason provided';
            if (!member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
                return await interaction.reply({ content: '❌ You do not have permission to unmute members.', ephemeral: true });
            }
            if (!guild.members.me.permissions.has(PermissionFlagsBits.ModerateMembers)) {
                return await interaction.reply({ content: `❌ I (${botTag}) do not have permission to unmute members. Please check my role permissions.`, ephemeral: true
