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

   const queuedTracks = queue!.tracks.toArray();
   if (!queuedTracks[0]) {
      interaction.reply({
         content: 'No hay musica en la cola.',
         ephemeral: true,
      });
      return;
   }

   const skipEmbed = new EmbedBuilder()
      .setAuthor({
         name: interaction.client.user.tag,
         iconURL: interaction.client.user.displayAvatarURL(),
      })
      .setThumbnail(queue!.currentTrack!.thumbnail)
      .setColor('#FF0000')
      .setTitle('Cancion saltada ⏭')
      .setDescription(
         `Reproduciendose: ${queuedTracks[0].title} ${queuedTracks[0].queryType != 'arbitrary' ? `([Link](${queuedTracks[0].url}))` : ''}`
      )
      .setTimestamp()
      .setFooter({
         text: `Solicitada por: ${interaction.user.username}`,
      });

   try {
      queue!.node.skip();
      interaction.reply({ embeds: [skipEmbed] });
   } catch (error) {
      console.error(`Hubo un error al omitir la cancion: ${error}`);

      interaction.reply({
         content: `Algo ha ocurrido, hubo un error al saltar la cancion. Intentelo de nuevo.`,
         ephemeral: true,
      });
   }
};

export const data = new SlashCommandBuilder().setName('skip').setDescription('Salta la cancion actual.');
