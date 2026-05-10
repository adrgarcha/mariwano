import { useQueue } from 'discord-player';
import { EmbedBuilder, GuildMember, MessageFlags, SlashCommandBuilder } from 'discord.js';
import { CommandProps } from '../../lib/types';

export const run = async ({ interaction }: CommandProps) => {
   if (!interaction.guild) {
      interaction.reply({
         content: 'Solo puedes ejecutar este comando en un servidor.',
         flags: MessageFlags.Ephemeral,
      });
      return;
   }

   const queue = useQueue(interaction.guild.id);
   const interactionMember = interaction.member as GuildMember;

   if (!interactionMember.voice.channelId) {
      await interaction.followUp({
         content: 'No estas en un canal de voz.',
         flags: MessageFlags.Ephemeral,
      });
      return;
   }

   if (interaction.guild.members.me?.voice.channelId && interactionMember.voice.channelId !== interaction.guild.members.me?.voice.channelId) {
      await interaction.followUp({
         content: 'No te encuentras en el mismo canal de voz que yo.',
         flags: MessageFlags.Ephemeral,
      });
      return;
   }

   if (!queue || !queue.isPlaying()) {
      interaction.reply({
         content: 'No hay musica reproduciendose.',
         flags: MessageFlags.Ephemeral,
      });
      return;
   }

   const currentTrack = queue.currentTrack!;

   const skipEmbed = new EmbedBuilder()
      .setAuthor({
         name: interaction.client.user.tag,
         iconURL: interaction.client.user.displayAvatarURL(),
      })
      .setThumbnail(currentTrack.thumbnail)
      .setColor('#FF0000')
      .setTitle('Cancion saltada ⏭')
      .setDescription(`Saltada: ${currentTrack.title} ${currentTrack.queryType != 'arbitrary' ? `([Link](${currentTrack.url}))` : ''}`)
      .setTimestamp()
      .setFooter({
         text: `Solicitada por: ${interaction.user.username}`,
      });

   try {
      queue.node.skip();
      interaction.reply({ embeds: [skipEmbed] });
   } catch (error) {
      console.error(`Hubo un error al omitir la cancion: ${error}`);

      interaction.reply({
         content: `Algo ha ocurrido, hubo un error al saltar la cancion. Intentelo de nuevo.`,
         flags: MessageFlags.Ephemeral,
      });
   }
};

export const data = new SlashCommandBuilder().setName('skip').setDescription('Salta la cancion actual.');
