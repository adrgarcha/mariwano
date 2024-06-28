import { SlashCommandBuilder, ChannelType } from 'discord.js';
import { GuildConfiguration } from '../../models/GuildConfiguration';
import { SlashCommandProps } from 'commandkit';

module.exports = {
   run: async ({ interaction }: SlashCommandProps) => {
      if (!interaction.memberPermissions?.has('Administrator')) {
         await interaction.reply('Solo los administradores pueden ejecutar este comando.');
         return;
      }

      let guildConfiguration = await GuildConfiguration.findOne({
         guildId: interaction.guildId,
      });

      if (!guildConfiguration) {
         guildConfiguration = new GuildConfiguration({
            guildId: interaction.guildId,
         });
      }

      const subcommand = interaction.options.getSubcommand();

      if (subcommand === 'add') {
         const channel = interaction.options.getChannel('channel');

         if (guildConfiguration.welcomeChannelIds.includes(channel!!.id)) {
            await interaction.reply(`${channel} ya es un canal de bienvenida.`);
            return;
         }

         guildConfiguration.welcomeChannelIds.push(channel!.id);

         if (guildConfiguration.welcomeChannelIds.length > 1) {
            const channelIdIndex = guildConfiguration.welcomeChannelIds.indexOf(channel!.id);
            guildConfiguration.welcomeChannelIds.splice(channelIdIndex, 1);
            await interaction.reply(`No puedes agregar más canales de bienvenida.`);
            return;
         }

         await guildConfiguration.save();

         await interaction.reply(`Se ha agregado ${channel} como canal de bienvenida.`);
         return;
      }

      if (subcommand === 'remove') {
         const channel = interaction.options.getChannel('channel');

         if (!guildConfiguration.welcomeChannelIds.includes(channel!.id)) {
            await interaction.reply(`${channel} no es un canal de bienvenida.`);
            return;
         }

         guildConfiguration.welcomeChannelIds = guildConfiguration.welcomeChannelIds.filter(id => id !== channel!.id);
         await guildConfiguration.save();

         await interaction.reply(`Se ha eliminado ${channel} como canal de bienvenida.`);
         return;
      }
   },
   data: new SlashCommandBuilder()
      .setName('config-welcome')
      .setDescription('Configura los mensajes de bienvenida.')
      .setDMPermission(false)
      .addSubcommand(subcommand =>
         subcommand
            .setName('add')
            .setDescription('Agrega un canal de bienvenida.')
            .addChannelOption(option =>
               option.setName('channel').setDescription('El canal que quieres agregar.').addChannelTypes(ChannelType.GuildText).setRequired(true)
            )
      )
      .addSubcommand(subcommand =>
         subcommand
            .setName('remove')
            .setDescription('Elimina un canal de bienvenida.')
            .addChannelOption(option =>
               option.setName('channel').setDescription('El canal que quieres eliminar.').addChannelTypes(ChannelType.GuildText).setRequired(true)
            )
      ),
};
