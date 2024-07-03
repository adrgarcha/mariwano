import { SlashCommandProps } from 'commandkit';
import { useQueue } from 'discord-player';
import { EmbedBuilder, GuildMember, SlashCommandBuilder } from 'discord.js';

module.exports = {
   run: async ({ interaction }: SlashCommandProps) => {
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

      const clearEmbed = new EmbedBuilder()
         .setAuthor({
            name: interaction.client.user.tag,
            iconURL: interaction.client.user.displayAvatarURL(),
         })
         .setThumbnail(interaction.guild.iconURL())
         .setColor('#FF0000')
         .setTitle('Limpiar la cola 🧹')
         .setDescription('La musica que hay en la cola se ha limpiado.')
         .setTimestamp()
         .setFooter({
            text: `Solicitada por: ${interaction.user.username}`,
         });

      try {
         queue.tracks.clear();
         interaction.reply({ embeds: [clearEmbed] });
      } catch (error) {
         console.error(`Hubo un error al limpiar la cola: ${error}`);

         interaction.reply({
            content: `Algo ha ocurrido, hubo un error al limpiar las canciones. Intentelo de nuevo.`,
            ephemeral: true,
         });
      }
   },
   data: new SlashCommandBuilder().setName('clear').setDescription('Limpia la cola y elimina sus canciones.'),
};
