import { QueueRepeatMode, useQueue } from 'discord-player';
import { EmbedBuilder, GuildMember, SlashCommandBuilder } from 'discord.js';
import { CommandProps } from '../../lib/types';

const repeatModes: { [key: string]: QueueRepeatMode } = {
   off: QueueRepeatMode.OFF,
   track: QueueRepeatMode.TRACK,
   queue: QueueRepeatMode.QUEUE,
   autoplay: QueueRepeatMode.AUTOPLAY,
};

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

   const modeName = interaction.options.getString('mode', true);
   const modeValue = repeatModes[modeName.toLowerCase()];

   const mode =
      modeName === 'track'
         ? 'Bucle en modo 🔂'
         : modeName === 'queue'
         ? 'Bucle en modo 🔁'
         : modeName === 'autoplay'
         ? 'Bucle en modo 🤖'
         : 'Bucle apagado 🚫';

   const loopEmbed = new EmbedBuilder()
      .setAuthor({
         name: interaction.client.user.tag,
         iconURL: interaction.client.user.displayAvatarURL(),
      })
      .setThumbnail(interaction.guild.iconURL())
      .setColor('#FF0000')
      .setTitle(mode)
      .setDescription(`El modo del bucle es '${modeName}'`)
      .setTimestamp()
      .setFooter({
         text: `Solicitada por: ${interaction.user.username}`,
      });

   try {
      queue.setRepeatMode(modeValue);
      interaction.reply({ embeds: [loopEmbed] });
   } catch (error) {
      console.error(`Hubo un error al hacer un bucle: ${error}`);

      interaction.reply({
         content: `Algo ha ocurrido, hubo un error al hacer el bucle. Intentelo de nuevo.`,
         ephemeral: true,
      });
   }
};

export const data = new SlashCommandBuilder()
   .setName('loop')
   .setDescription('Hace un bucle a la cancion actual o a la cola.')
   .addStringOption(option =>
      option
         .setName('mode')
         .setDescription('Elige un modo de bucle.')
         .setRequired(true)
         .addChoices(
            Object.keys(repeatModes).map(modeName => ({
               name: modeName.charAt(0).toUpperCase() + modeName.slice(1),
               value: modeName,
            }))
         )
   );
