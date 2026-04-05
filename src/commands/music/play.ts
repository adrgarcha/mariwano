import { QueryType, useMainPlayer } from 'discord-player';
import { GuildMember, SlashCommandBuilder } from 'discord.js';
import { CommandProps } from '../../lib/types';

const player = useMainPlayer();

export const run = async ({ interaction }: CommandProps) => {
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
      new URL(query);
   } catch {
      await interaction.followUp({
         content: 'El parámetro `query` debe ser una URL válida. Plataformas soportadas: Spotify, SoundCloud, Apple Music, Vimeo, Facebook.',
         ephemeral: true,
      });
      return;
   }

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

      const searchResult = await player.search(query, {
         requestedBy: interaction.user,
         searchEngine: QueryType.AUTO,
      });

      if (!searchResult.tracks.length) {
         interaction.followUp({
            content: `No se ha podido encontrar la cancion que has pedido.`,
            ephemeral: true,
         });
         return;
      }

      const queue = player.nodes.create(interaction.guild, {
         metadata: interaction,
         bufferingTimeout: 15000,
         leaveOnStop: true,
         leaveOnStopCooldown: 5000,
         leaveOnEnd: true,
         leaveOnEndCooldown: 15000,
         leaveOnEmpty: true,
         leaveOnEmptyCooldown: 3000,
      });

      try {
         if (!queue.connection) {
            await queue.connect(interactionMember.voice.channel!);
         }
      } catch (error) {
         queue.delete();
         await interaction.followUp({
            content: 'No pude unirme a tu canal de voz: ' + error,
            ephemeral: true,
         });
         return;
      }

      queue.addTrack(searchResult.tracks[0]);

      if (!queue.isPlaying()) {
         await queue.node.play();
      }

      const message = searchResult.playlist
         ? `Se pusieron en la cola las canciones de: **${searchResult.playlist.title}**`
         : `Se añadió a la cola **${searchResult.tracks[0].author} - ${searchResult.tracks[0].title}**`;

      interaction.followUp({ content: message });
   } catch (error) {
      console.error(`Hubo un error al reproducir musica: ${error}`);

      interaction.followUp({
         content: 'Hubo un error al reproducir la musica.',
         ephemeral: true,
      });
      return;
   }
};

export const data = new SlashCommandBuilder()
   .setName('play')
   .setDescription('Reproduce una cancion en un canal de voz.')
   .addStringOption(option =>
      option.setName('query').setDescription('URL de la canción, álbum o playlist (Spotify, SoundCloud, Apple Music...)').setRequired(true)
   );
