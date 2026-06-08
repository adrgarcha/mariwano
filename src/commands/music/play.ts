import { QueryType, useMainPlayer } from 'discord-player';
import { GuildMember, MessageFlags, SlashCommandBuilder } from 'discord.js';
import { AutocompleteProps, CommandProps } from '../../lib/types';

export const autocomplete = async ({ interaction }: AutocompleteProps) => {
   const focused = interaction.options.getFocused();
   if (focused.length < 3) {
      await interaction.respond([]);
      return;
   }

   try {
      const player = useMainPlayer();
      const result = await player.search(focused, { searchEngine: QueryType.AUTO });
      const choices = result.tracks.slice(0, 25).map(track => ({
         name: `${track.author} - ${track.title}`.slice(0, 100),
         value: track.url.slice(0, 100),
      }));
      await interaction.respond(choices);
   } catch {
      await interaction.respond([]);
   }
};

export const run = async ({ interaction }: CommandProps) => {
   if (!interaction.guild) {
      await interaction.reply({
         content: 'Solo puedes ejecutar este comando en un servidor.',
         flags: MessageFlags.Ephemeral,
      });
      return;
   }

   const player = useMainPlayer();
   const query = interaction.options.getString('query', true);
   const interactionMember = interaction.member as GuildMember;

   if (!interactionMember.voice.channelId) {
      await interaction.reply({
         content: 'No estas en un canal de voz.',
         flags: MessageFlags.Ephemeral,
      });
      return;
   }

   if (interaction.guild.members.me?.voice.channelId && interactionMember.voice.channelId !== interaction.guild.members.me?.voice.channelId) {
      await interaction.reply({
         content: 'No te encuentras en el mismo canal de voz que yo.',
         flags: MessageFlags.Ephemeral,
      });
      return;
   }

   await interaction.deferReply();

   try {
      const searchResult = await player.search(query, {
         requestedBy: interaction.user,
         searchEngine: QueryType.AUTO,
      });

      if (!searchResult.tracks.length) {
         await interaction.editReply({ content: 'No se encontró ningún resultado para la búsqueda proporcionada.' });
         return;
      }

      const { track } = await player.play(interactionMember.voice.channel!, searchResult, {
         nodeOptions: {
            metadata: {
               channel: interaction.channel,
               requestedBy: interaction.user,
               guild: interaction.guild,
            },
            selfDeaf: true,
            bufferingTimeout: 150000,
            leaveOnStop: true,
            leaveOnStopCooldown: 50000,
            leaveOnEnd: true,
            leaveOnEndCooldown: 150000,
            leaveOnEmpty: true,
            leaveOnEmptyCooldown: 30000,
         },
      });

      const message = searchResult.playlist
         ? `Se pusieron en la cola las canciones de: **${searchResult.playlist.title}**`
         : `Se añadió a la cola **${track.author} - ${track.title}**`;

      await interaction.editReply({ content: message });
   } catch (error) {
      console.error(`Hubo un error al reproducir musica: ${error}`);
      await interaction.editReply({ content: 'Ocurrió un error al intentar reproducir la canción. Inténtalo de nuevo más tarde.' });
   }
};

export const data = new SlashCommandBuilder()
   .setName('play')
   .setDescription('Reproduce una cancion en un canal de voz.')
   .addStringOption(option =>
      option
         .setName('query')
         .setDescription('Nombre, artista o URL de la canción (YouTube, Spotify, SoundCloud...)')
         .setRequired(true)
         .setAutocomplete(true)
   );
