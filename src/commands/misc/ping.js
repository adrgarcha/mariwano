const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    run: ({ interaction, client }) => {
        interaction.reply(`Pong! ${client.ws.ping}ms`);
    },
    data: new SlashCommandBuilder().setName('ping').setDescription('Pong'),
}