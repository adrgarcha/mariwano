import { AutocompleteProps, SlashCommandProps } from 'commandkit';
import { useMainPlayer } from 'discord-player';
import { GuildMember, SlashCommandBuilder } from 'discord.js';

const player = useMainPlayer();

module.exports = {
   run: async ({ interaction }: SlashCommandProps) => {
      if (!interaction.guild) {
         interaction.reply({
            content: 'Solo puedes ejecutar este comando en un servidor.',
            ephemeral: true,
         });
         return;
      }

      await interaction.deferReply();
      const query = interaction.options.getString('query', true);
      const interactionMember = interaction.member as GuildMember;

      try {
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

         const searchResult = await player.search(query, { requestedBy: interaction.user });

         if (!searchResult.hasTracks()) {
            interaction.followUp({
               content: `No se ha podido encontrar la cancion que has pedido.`,
               ephemeral: true,
            });
            return;
         }

         const res = await player.play(interactionMember.voice.channelId, searchResult, {
            nodeOptions: {
               metadata: interaction,
               bufferingTimeout: 15000,
               leaveOnStop: true,
               leaveOnStopCooldown: 5000,
               leaveOnEnd: true,
               leaveOnEndCooldown: 15000,
               leaveOnEmpty: true,
               leaveOnEmptyCooldown: 300000,
            },
         });

         const message = res.track.playlist
            ? `Se pusieron en la cola las canciones de: **${res.track.playlist.title}**`
            : `Se puso en cola: **${res.track.author} - ${res.track.title}**`;

         interaction.followUp({
            content: message,
         });

         return;
      } catch (error) {
         console.error(`Hubo un error al reproducir musica: ${error}`);

         interaction.followUp({
            content: 'Hubo un error al reproducir la musica.',
            ephemeral: true,
         });
         return;
      }
   },
   autocomplete: async ({ interaction }: AutocompleteProps) => {
      const query = interaction.options.getString('query');
      let returnData = [];
      if (query) {
         const result = await player.search(query);
         if (result.playlist) {
            const title = result.playlist.title.length > 100 ? result.playlist.title.substring(0, 90) + '...' : result.playlist.title;
            returnData.push({ name: `${title} | Playlist`, value: query });
         }
         for (const track of result.tracks.slice(0, 6)) {
            const title = track.title.length > 100 ? track.title.substring(0, 90) + '...' : track.title;
            returnData.push({ name: title, value: track.url });
         }
      }
      await interaction.respond(returnData);
   },
   data: new SlashCommandBuilder()
      .setName('play')
      .setDescription('Reproduce una cancion el un canal de voz.')
      .addStringOption(option =>
         option.setName('query').setDescription('La cancion que quieres reproducir.').setRequired(true).setAutocomplete(true)
      ),
};
