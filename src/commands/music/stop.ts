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

      if (!queue || !queue.isPlaying()) {
         interaction.reply({
            content: 'No hay musica reproduciendose.',
            ephemeral: true,
         });
         return;
      }

      const stopEmbed = new EmbedBuilder()
         .setAuthor({
            name: interaction.client.user.tag,
            iconURL: interaction.client.user.displayAvatarURL(),
         })
         .setThumbnail(interaction.guild.iconURL())
         .setColor('#FF0000')
         .setTitle('Musica detenida 🛑')
         .setDescription('La musica se ha detenido... Saliendo del canal.')
         .setTimestamp()
         .setFooter({
            text: `Solicitada por: ${interaction.user.username}`,
         });

      try {
         queue.delete();
         interaction.reply({ embeds: [stopEmbed] });
      } catch (error) {
         console.error(`Hubo un error al detener la musica: ${error}`);

         interaction.reply({
            content: `Algo ha ocurrido, hubo un error al detener la cola. Intentelo de nuevo.`,
            ephemeral: true,
         });
      }
   },
   data: new SlashCommandBuilder().setName('stop').setDescription('Desconecta al bot del canal de voz y borra la cola.'),
};
