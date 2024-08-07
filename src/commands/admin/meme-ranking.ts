import { ChannelType, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { CommandProps } from '../../lib/types';
import { MemeRanking } from '../../models/MemeRanking';

export const run = async ({ interaction }: CommandProps) => {
   if (!interaction.memberPermissions?.has('Administrator')) {
      await interaction.reply('Solo los administradores pueden ejecutar este comando.');
      return;
   }

   if (!interaction.guild) {
      interaction.reply('Solo puedes ejecutar este comando en un servidor.');
      return;
   }

   try {
      await interaction.deferReply({ ephemeral: true });

      let memeGuildConfiguration = await MemeRanking.findOne({
         guildId: interaction.guildId,
      });

      if (!memeGuildConfiguration) {
         memeGuildConfiguration = new MemeRanking({
            guildId: interaction.guildId,
         });
      }

      const channel = interaction.options.getChannel('canal');
      const subcommand = interaction.options.getSubcommand();
      switch (subcommand) {
         case 'setup':
            if (memeGuildConfiguration.rankingChannelId) {
               await interaction.editReply(`Ya hay un canal de ranking de memes configurado.`);
               return;
            }

            memeGuildConfiguration = new MemeRanking({
               guildId: interaction.guildId,
               rankingChannelId: channel?.id,
               lastRanking: new Date().setMonth(9),
            });

            await memeGuildConfiguration.save();

            await interaction.editReply(`Se ha agregado ${channel} como canal de memes.`);
            return;
         case 'disable':
            if (!memeGuildConfiguration.rankingChannelId) {
               await interaction.editReply(`${channel} no es un canal de ranking de memes.`);
               return;
            }
            const memeConfigs = await MemeRanking.find();
            for (const memeConfig of memeConfigs) {
               await memeConfig.deleteOne();
            }

            await memeGuildConfiguration.deleteOne();

            await interaction.editReply(`Se ha eliminado ${channel} como canal de ranking de memes.`);
            return;
         default:
            return;
      }
   } catch (error) {
      console.error(`Hubo un error al configurar el ranking de memes: ${error}`);
   }
};

export const data = new SlashCommandBuilder()
   .setName('meme-ranking')
   .setDescription('Crea un ranking de los mejores memes de la semana')
   .addSubcommand(subcommand =>
      subcommand
         .setName('setup')
         .setDescription(`Configurar el canal del ranking de memes`)
         .addChannelOption(option =>
            option.setName('canal').setDescription('Canal de memes a configurar').addChannelTypes(ChannelType.GuildText).setRequired(true)
         )
   )
   .addSubcommand(subcommand =>
      subcommand
         .setName('disable')
         .setDescription('Elimina el canal de ranking de memes')
         .addChannelOption(option =>
            option.setName('canal').setDescription('El canal que quieres eliminar.').addChannelTypes(ChannelType.GuildText).setRequired(true)
         )
   )
   .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
