require('dotenv').config();
const { REST, Routes, ApplicationCommandOptionType } = require('discord.js');

const commands = [
    {
        name: 'sumar',
        description: 'Suma dos numeros por si tu no te acuerdas de sumar.',
        options: [
            {
                name: 'primer-numero',
                description: 'El primer numero que se suma',
                type: ApplicationCommandOptionType.Number,
                required: true,
            },
            {
                name: 'segundo-numero',
                description: 'El segundo numero que se suma',
                type: ApplicationCommandOptionType.Number,
                required: true,
            },
        ],
    },
    {
        name: 'embed',
        description: 'Envia un embed',
        
    },
];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log('Registrando comandos...');

        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands }
        );

        console.log('Los comandos se registraron correctamente.');
    } catch (error) {
        console.log(`Hubo un error: ${error}`);
    }
})();