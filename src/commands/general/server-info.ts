import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { CommandProps } from '../../lib/types';

export const run = async ({ interaction }: CommandProps) => {
   if (!interaction.guild) {
      interaction.reply({
         content: 'Solo puedes ejecutar este comando dentro de un servidor.',
         ephemeral: true,
      });
      return;
   }

   try {
      const { guild } = interaction;

      const serverInfoEmbed = new EmbedBuilder({
         author: { name: guild.name, iconURL: guild.iconURL({ size: 256 }) as string },
         fields: [
            {
               name: 'Dueño',
               value: (await guild.fetchOwner()).user.username,
               inline: true,
            },
            {
               name: 'Canales de texto',
               value: guild.channels.cache
                  .filter(c => c.type === 0)
                  .toJSON()
                  .length.toString(),
               inline: true,
            },
            {
               name: 'Canales de voz',
               value: guild.channels.cache
                  .filter(c => c.type === 2)
                  .toJSON()
                  .length.toString(),
               inline: true,
            },
            {
               name: 'Canales de categoría',
               value: guild.channels.cache
                  .filter(c => c.type === 4)
                  .toJSON()
                  .length.toString(),
               inline: true,
            },
            {
               name: 'Miembros',
               value: guild.memberCount.toString(),
               inline: true,
            },
            {
               name: 'Roles',
               value: guild.roles.cache.size.toString(),
               inline: true,
            },
            {
               name: 'Lista de roles',
               value: guild.roles.cache.toJSON().join(', '),
            },
         ],
         footer: {
            text: `ID: ${guild.id} | Fecha de creación: ${guild.createdAt.toDateString()}`,
         },
      });

      interaction.reply({ embeds: [serverInfoEmbed] });
   } catch (error) {
      console.error(`Hubo un error al ejecutar el comando 'server-info': ${error}`);
   }
};

export const data = new SlashCommandBuilder().setName('server-info').setDescription('Información sobre el servidor.');
