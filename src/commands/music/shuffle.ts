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

   const shuffleEmbed = new EmbedBuilder()
      .setAuthor({
         name: interaction.client.user.tag,
         iconURL: interaction.client.user.displayAvatarURL(),
      })
      .setThumbnail(interaction.guild.iconURL())
      .setColor('#FF0000')
      .setTitle('Canciones mezcladas 🔀')
      .setDescription('La musica que hay en la cola se ha mezclado.')
      .setTimestamp()
      .setFooter({
         text: `Solicitada por: ${interaction.user.username}`,
      });

   try {
      queue.tracks.shuffle();
      interaction.reply({ embeds: [shuffleEmbed] });
   } catch (error) {
      console.error(`Hubo un error al mezclar la cola: ${error}`);

      interaction.reply({
         content: `Algo ha ocurrido, hubo un error al mezclar las canciones. Intentelo de nuevo.`,
         ephemeral: true,
      });
   }
};

export const data = new SlashCommandBuilder().setName('shuffle').setDescription('Mezcla las canciones de la cola.');
