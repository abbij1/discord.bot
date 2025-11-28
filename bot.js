const { Client, GatewayIntentBits, Collection, REST, Routes, PermissionFlagsBits } = require('discord.js');
const express = require('express');

// --- 1. EXPRESS SERVER (for Render/Hosting Health Check) ---

const app = express();
// Use the port provided by the hosting environment (Render)
const port = process.env.PORT || 3000;

// Keep-alive server endpoint
app.get('/', (req, res) => {
    res.status(200).send('Discord Bot is running and responding to basic commands.');
});

// --- 2. DISCORD CLIENT SETUP ---

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent, // Necessary to read message content
        GatewayIntentBits.GuildMembers // Needed for moderation commands
    ]
});

// Create a collection for commands
client.commands = new Collection();

// Define slash commands
const commands = [
    {
        name: 'ban',
        description: 'Ban a member from the server',
        options: [
            {
                name: 'user',
                type: 6, // USER type
                description: 'The user to ban',
                required: true
            },
            {
                name: 'reason',
                type: 3, // STRING type
                description: 'Reason for the ban',
                required: false
            }
        ],
        default_member_permissions: PermissionFlagsBits.BanMembers.toString()
    },
    {
        name: 'unban',
        description: 'Unban a user from the server',
        options: [
            {
                name: 'user_id',
                type: 3, // STRING type
                description: 'The user ID to unban',
                required: true
            },
            {
                name: 'reason',
                type: 3, // STRING type
                description: 'Reason for the unban',
                required: false
            }
        ],
        default_member_permissions: PermissionFlagsBits.BanMembers.toString()
    },
    {
        name: 'kick',
        description: 'Kick a member from the server',
        options: [
            {
                name: 'user',
                type: 6, // USER type
                description: 'The user to kick',
                required: true
            },
            {
                name: 'reason',
                type: 3, // STRING type
                description: 'Reason for the kick',
                required: false
            }
        ],
        default_member_permissions: PermissionFlagsBits.KickMembers.toString()
    },
    {
        name: 'mute',
        description: 'Mute a member in the server',
        options: [
            {
                name: 'user',
                type: 6, // USER type
                description: 'The user to mute',
                required: true
            },
            {
                name: 'duration',
                type: 4, // INTEGER type
                description: 'Duration in minutes (default: 10)',
                required: false
            },
            {
                name: 'reason',
                type: 3, // STRING type
                description: 'Reason for the mute',
                required: false
            }
        ],
        default_member_permissions: PermissionFlagsBits.ModerateMembers.toString()
    },
    {
        name: 'unmute',
        description: 'Unmute a member in the server',
        options: [
            {
                name: 'user',
                type: 6, // USER type
                description: 'The user to unmute',
                required: true
            },
            {
                name: 'reason',
                type: 3, // STRING type
                description: 'Reason for the unmute',
                required: false
            }
        ],
        default_member_permissions: PermissionFlagsBits.ModerateMembers.toString()
    }
];

// Register commands when bot is ready
client.on('ready', async () => {
    console.log(`✅ Bot is online as ${client.user.tag}`);
    client.user.setActivity('for simple phrases', { type: 'WATCHING' });

    // Register slash commands
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

    try {
        console.log('🔄 Registering slash commands...');
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands }
        );
        console.log('✅ Slash commands registered successfully!');
    } catch (error) {
        console.error('❌ Error registering commands:', error);
    }
});

// Handle slash command interactions
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName, options, member, guild } = interaction;

    try {
        if (commandName === 'ban') {
            const user = options.getUser('user');
            const reason = options.getString('reason') || 'No reason provided';

            // Check if user has permission
            if (!member.permissions.has(PermissionFlagsBits.BanMembers)) {
                return await interaction.reply({ content: '❌ You do not have permission to ban members.', ephemeral: true });
            }

            const targetMember = guild.members.cache.get(user.id);
            
            // Check if bot has permission
            if (!guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) {
                return await interaction.reply({ content: '❌ I do not have permission to ban members. Please check my role permissions.', ephemeral: true });
            }

            // Check if target is bannable
            if (!targetMember.bannable) {
                return await interaction.reply({ content: '❌ I cannot ban this user. They might have higher permissions.', ephemeral: true });
            }

            await targetMember.ban({ reason });
            await interaction.reply(`✅ Successfully banned **${user.tag}**. Reason: ${reason}`);

        } else if (commandName === 'unban') {
            const userId = options.getString('user_id');
            const reason = options.getString('reason') || 'No reason provided';

            // Check if user has permission
            if (!member.permissions.has(PermissionFlagsBits.BanMembers)) {
                return await interaction.reply({ content: '❌ You do not have permission to unban members.', ephemeral: true });
            }

            // Check if bot has permission
            if (!guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) {
                return await interaction.reply({ content: '❌ I do not have permission to unban members. Please check my role permissions.', ephemeral: true });
            }

            try {
                // Validate user ID format
                if (!/^\d{17,20}$/.test(userId)) {
                    return await interaction.reply({ content: '❌ Invalid user ID format. Please provide a valid Discord user ID.', ephemeral: true });
                }

                // Fetch the ban to make sure the user is actually banned
                await guild.bans.fetch(userId);
                await guild.members.unban(userId, reason);
                await interaction.reply(`✅ Successfully unbanned user with ID: **${userId}**. Reason: ${reason}`);
            } catch (error) {
                if (error.code === 10026) { // Unknown Ban error code
                    await interaction.reply({ content: '❌ This user is not banned.', ephemeral: true });
                } else if (error.code === 50035) { // Invalid User ID
                    await interaction.reply({ content: '❌ Invalid user ID provided.', ephemeral: true });
                } else {
                    console.error('Unban error:', error);
                    await interaction.reply({ content: '❌ There was an error unbanning this user. Make sure I have "Ban Members" permission.', ephemeral: true });
                }
            }

        } else if (commandName === 'kick') {
            const user = options.getUser('user');
            const reason = options.getString('reason') || 'No reason provided';

            // Check if user has permission
            if (!member.permissions.has(PermissionFlagsBits.KickMembers)) {
                return await interaction.reply({ content: '❌ You do not have permission to kick members.', ephemeral: true });
            }

            // Check if bot has permission
            if (!guild.members.me.permissions.has(PermissionFlagsBits.KickMembers)) {
                return await interaction.reply({ content: '❌ I do not have permission to kick members. Please check my role permissions.', ephemeral: true });
            }

            const targetMember = guild.members.cache.get(user.id);
            
            // Check if target is kickable
            if (!targetMember.kickable) {
                return await interaction.reply({ content: '❌ I cannot kick this user. They might have higher permissions.', ephemeral: true });
            }

            await targetMember.kick(reason);
            await interaction.reply(`✅ Successfully kicked **${user.tag}**. Reason: ${reason}`);

        } else if (commandName === 'mute') {
            const user = options.getUser('user');
            const duration = options.getInteger('duration') || 10; // Default 10 minutes
            const reason = options.getString('reason') || 'No reason provided';

            // Check if user has permission
            if (!member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
                return await interaction.reply({ content: '❌ You do not have permission to mute members.', ephemeral: true });
            }

            // Check if bot has permission
            if (!guild.members.me.permissions.has(PermissionFlagsBits.ModerateMembers)) {
                return await interaction.reply({ content: '❌ I do not have permission to mute members. Please check my role permissions.', ephemeral: true });
            }

            const targetMember = guild.members.cache.get(user.id);
            
            // Check if target is moderatable
            if (!targetMember.moderatable) {
                return await interaction.reply({ content: '❌ I cannot mute this user. They might have higher permissions.', ephemeral: true });
            }

            // Convert minutes to milliseconds
            const durationMs = duration * 60 * 1000;
            
            // Check if duration is within Discord's limits (max 28 days)
            if (durationMs > 28 * 24 * 60 * 60 * 1000) {
                return await interaction.reply({ content: '❌ Mute duration cannot exceed 28 days.', ephemeral: true });
            }

            await targetMember.timeout(durationMs, reason);
            
            let durationText = duration === 1 ? '1 minute' : `${duration} minutes`;
            await interaction.reply(`✅ Successfully muted **${user.tag}** for ${durationText}. Reason: ${reason}`);

        } else if (commandName === 'unmute') {
            const user = options.getUser('user');
            const reason = options.getString('reason') || 'No reason provided';

            // Check if user has permission
            if (!member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
                return await interaction.reply({ content: '❌ You do not have permission to unmute members.', ephemeral: true });
            }

            // Check if bot has permission
            if (!guild.members.me.permissions.has(PermissionFlagsBits.ModerateMembers)) {
                return await interaction.reply({ content: '❌ I do not have permission to unmute members. Please check my role permissions.', ephemeral: true });
            }

            const targetMember = guild.members.cache.get(user.id);
            
            // Check if target is moderatable
            if (!targetMember.moderatable) {
                return await interaction.reply({ content: '❌ I cannot unmute this user. They might have higher permissions.', ephemeral: true });
            }

            // Check if user is actually muted
            if (!targetMember.isCommunicationDisabled()) {
                return await interaction.reply({ content: '❌ This user is not muted.', ephemeral: true });
            }

            await targetMember.timeout(null, reason);
            await interaction.reply(`✅ Successfully unmuted **${user.tag}**. Reason: ${reason}`);
        }
    } catch (error) {
        console.error('Error executing command:', error);
        await interaction.reply({ content: '❌ There was an error executing this command.', ephemeral: true });
    }
});

// Your existing message reply functionality (unchanged)
client.on('messageCreate', (message) => {
    // Ignore messages from the bot itself
    if (message.author.bot) return;
    
    // Normalize and clean the message content for easy matching
    const content = message.content.toLowerCase().trim();
    
    // Use if/else if to ensure only ONE response is sent per message
    if (content.includes('hi') || content.includes('hello')) {
        // Send directly to the channel without tagging the user
        message.channel.send('haiii');
    } else if (content.includes('aya')) {
        // Send directly to the channel without tagging the user
        message.channel.send('fat and retarded');
    } else if (content.includes('oron')) {
        // Send directly to the channel without tagging the user
        message.channel.send('your daddy');
    } else if (content.includes('abbi')) {
        // Send directly to the channel without tagging the user
        message.channel.send('best kitten');
    } else if (content.includes('fatran')) {
        // Send directly to the channel without tagging the user
        message.channel.send('airpor/10');
    } else if (content.includes('soobie')) {
        // Send directly to the channel without tagging the user
        message.channel.send('busy eating fried chicken');
    } else if (content.includes('ethan')) {
        // Send directly to the channel without tagging the user
        message.channel.send('our bbg :3');
    } else if (content.includes('randle')) {
        // Send directly to the channel without tagging the user
        message.channel.send('little omega');
    }
});

// --- 3. INITIALIZATION ---

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;

if (!DISCORD_TOKEN) {
    console.error("❌ Error: DISCORD_TOKEN is missing in Environment Variables! Bot will not start.");
} else {
    // Start the Discord Bot
    client.login(DISCORD_TOKEN)
        .catch(err => {
            console.error("🚨 Failed to log into Discord:", err);
            process.exit(1);
        });

    // Start the Express server for health checks
    app.listen(port, () => {
        console.log(`🔄 Keep-alive server running on port ${port}`);
    });
}