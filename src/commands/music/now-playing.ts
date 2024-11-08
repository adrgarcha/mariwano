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

   try {
      const progress = queue.node.createProgressBar();
      const create = progress?.replace(/ 0:00/g, ' ◉ EN DIRECTO');

      const npEmbed = new EmbedBuilder()
         .setAuthor({
            name: interaction.client.user.tag,
            iconURL: interaction.client.user.displayAvatarURL(),
         })
         .setThumbnail(queue.currentTrack!.thumbnail)
         .setColor('#FF0000')
         .setTitle('Reproduciendo... 🎵')
         .setDescription(
            `${queue.currentTrack!.title} ${queue.currentTrack!.queryType != 'arbitrary' ? `([Link](${queue.currentTrack!.url}))` : ''}\n${create}`
         )
         .setTimestamp();

      if (queue.currentTrack!.requestedBy != null) {
         npEmbed.setFooter({
            text: `Solicitada por: ${interaction.user.username}`,
         });
      }

      interaction.reply({ embeds: [npEmbed] });
   } catch (error) {
      console.error(`Hubo un error al mostrar la cancion actual: ${error}`);
   }
};

export const data = new SlashCommandBuilder().setName('now-playing').setDescription('Muestra la cancion actual.');
