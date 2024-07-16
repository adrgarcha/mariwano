import { useQueue } from 'discord-player';
import { EmbedBuilder, GuildMember, SlashCommandBuilder } from 'discord.js';
import { CommandProps } from '../../lib/types';

export const run = async ({ interaction }: CommandProps) => {
   if (!interaction.guild) {
      interaction.reply({
         content: 'Solo puedes ejecutar este comando en un servidor.',
         ephemeral: true,
      });
      return;
   }

   const queue = useQueue(interaction.guild.id);
   const interactionMember = interaction.member as GuildMember;

   if (!interactionMember.voice.channelId) {
      await interaction.followUp({
         content: 'No estas en un canal de voz.',
         ephemeral: true,
      });
      return;
   }

   if (interaction.guild.members.me?.voice.channelId && interactionMember.voice.channelId !== interaction.guild.members.me?.voice.channelId) {
      await interaction.followUp({
         content: 'No te encuentras en el mismo canal de voz que yo.',
         ephemeral: true,
      });
      return;
   }

   if (!queue || !queue.isPlaying()) {
      interaction.reply({
         content: 'No hay musica reproduciendose.',
         ephemeral: true,
      });
      return;
   }

   const previousTracks = queue.history.tracks.toArray();
   if (!previousTracks[0]) {
      interaction.reply({
         content: 'No hay historial de musica anterior a la cancion actual.',
         ephemeral: true,
      });
      return;
   }

   const previousEmbed = new EmbedBuilder()
      .setAuthor({
         name: interaction.client.user.tag,
         iconURL: interaction.client.user.displayAvatarURL(),
      })
      .setThumbnail(interaction.guild.iconURL())
      .setColor('#FF0000')
      .setTitle('Reproduciendo la cancion anterior ⏮')
      .setDescription(
         `Volviendo a la cancion previa: ${previousTracks[0].title} ${
            previousTracks[0].queryType != 'arbitrary' ? `([Link](${previousTracks[0].url}))` : ''
         }`
      )
      .setTimestamp()
      .setFooter({
         text: `Solicitada por: ${interaction.user.username}`,
      });

   try {
      queue.history.back();
      interaction.reply({ embeds: [previousEmbed] });
   } catch (error) {
      console.error(`Hubo un error al reproducir la cancion anterior: ${error}`);

      interaction.reply({
         content: `Algo ha ocurrido, hubo un error al reproducir la cancion anterior. Intentelo de nuevo.`,
         ephemeral: true,
      });
   }
};

export const data = new SlashCommandBuilder().setName('previous').setDescription('Reproduce la cancion anterior.');
