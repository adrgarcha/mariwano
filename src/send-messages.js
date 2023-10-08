require('dotenv').config();

const { Client, IntentsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ],
});

const roles = [
    {
        id: '1160588953334861844',
        label: 'RED'
    },
    {
        id: '1160589069613543616',
        label: 'BLUE'
    },
    {
        id: '1160589099099492444',
        label: 'GREEN'
    },
]

// ROLES EN BOTONES
client.on('ready', async (c) => {
    try {
        const channel = await client.channels.cache.get('1160575692455563365');
        if(!channel) return;

        const row = new ActionRowBuilder();
        roles.forEach((role) =>{
            row.components.push(
                new ButtonBuilder()
                .setCustomId(role.id)
                .setLabel(role.label)
                .setStyle(ButtonStyle.Primary)
            );
        });

        await channel.send({
            content: 'Selecciona uno de los roles de abajo.',
            components: [row],
        })
        process.exit();
    } catch (error) {
        console.log(`Ha ocurrido un error: ${error}`);
    }
});

client.login(process.env.DISCORD_TOKEN);