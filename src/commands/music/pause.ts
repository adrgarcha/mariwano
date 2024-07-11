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

      let checkPause = queue.node.isPaused();

      try {
         const pauseEmbed = new EmbedBuilder()
            .setAuthor({
               name: interaction.client.user.tag,
               iconURL: interaction.client.user.displayAvatarURL(),
            })
            .setThumbnail(queue.currentTrack!.thumbnail)
            .setColor('#FF0000')
            .setTitle(`La cancion ${checkPause ? 'continua' : 'se ha pausado'} ⏯`)
            .setDescription(
               `La reproduccion ha sido **${checkPause ? 'continuada' : 'pausada'}**.
            Se esta reproduciendo ${queue.currentTrack!.title} ${
                  queue.currentTrack!.queryType != 'arbitrary' ? `([Link](${queue.currentTrack!.url}))` : ''
               }.`
            )
            .setTimestamp()
            .setFooter({
               text: `Solicitada por: ${interaction.user.username}`,
            });

         queue.node.setPaused(!queue.node.isPaused());
         interaction.reply({ embeds: [pauseEmbed] });
      } catch (error) {
         console.error(`Hubo un error al pausar la cancion: ${error}`);

         interaction.reply({
            content: `Parece que hubo un error ${checkPause ? 'al continuar' : 'al pausar'} la cancion. Intentelo de nuevo.`,
            ephemeral: true,
         });
      }
   },
   data: new SlashCommandBuilder().setName('pause').setDescription('Pausa o continua la cancion actual.'),
};
