const { SlashCommandBuilder, ChannelType, ChatInputCommandInteraction } = require('discord.js');
const GuildConfiguration = require('../../models/GuildConfiguration');

module.exports = {
    /**
     * 
     * @param {Object} param0 
     * @param {ChatInputCommandInteraction} param0.interaction
     */
    run: async ({ interaction }) => {
        if(!interaction.memberPermissions.has('Administrator')){
            await interaction.reply('Solo los administradores pueden ejecutar este comando.');
            return;
        }

        let guildConfiguration = await GuildConfiguration.findOne({ guildId: interaction.guildId });

        if(!guildConfiguration){
            guildConfiguration = new GuildConfiguration({ guildId: interaction.guildId });
        }

        const subcommand = interaction.options.getSubcommand();

        if(subcommand === 'add'){
            const channel = interaction.options.getChannel('channel');

            if(guildConfiguration.suggestionChannelIds.includes(channel.id)){
                await interaction.reply(`${channel} ya es un canal de sugerencias.`);
                return;
            }

            guildConfiguration.suggestionChannelIds.push(channel.id);
            await guildConfiguration.save();

            await interaction.reply(`Se ha agregado ${channel} como canal de sugerencias.`);
            return;
        }

        if(subcommand === 'remove'){
            const channel = interaction.options.getChannel('channel');

            if(!guildConfiguration.suggestionChannelIds.includes(channel.id)){
                await interaction.reply(`${channel} no es un canal de sugerencias.`);
                return;
            }

            guildConfiguration.suggestionChannelIds = guildConfiguration.suggestionChannelIds.filter(
                (id) => id !== channel.id
            );
            await guildConfiguration.save();
            
            await interaction.reply(`Se ha eliminado ${channel} como canal de sugerencias.`);
            return;
        }
    },
    data: new SlashCommandBuilder()
    .setName('config-suggestions')
    .setDescription('Configura las sugerencias.')
    .setDMPermission(false)
    .addSubcommand((subcommand) => 
        subcommand.setName('add').setDescription('Agrega un canal de sugerencias.').addChannelOption((option) => 
            option.setName('channel').setDescription('El canal que quieres agregar.').addChannelTypes(ChannelType.GuildText).setRequired(true)))
    .addSubcommand((subcommand) => 
        subcommand.setName('remove').setDescription('Elimina un canal de sugerencias.').addChannelOption((option) => 
            option.setName('channel').setDescription('El canal que quieres eliminar.').addChannelTypes(ChannelType.GuildText).setRequired(true))),
}