const { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } = require("discord.js");

module.exports = {
    /**
     * 
     * @param {Object} param0 
     * @param {ChatInputCommandInteraction} param0.interaction
     */
    run: ({ interaction }) => {
        const embed = new EmbedBuilder()
            .setTitle(interaction.options.get('title').value)
            .setDescription(interaction.options.get('description').value)
            .setColor('Random');
        
        interaction.reply({ embeds: [embed] });
    },
    data: new SlashCommandBuilder().setName('embed').setDescription('Crea un embed.')
        .addStringOption((option) => option.setName('title').setDescription('Establece el titulo del embed.').setRequired(true))
        .addStringOption((option) => option.setName('description').setDescription('Establece la descripcion del embed.').setRequired(true)),
}