import { ChannelType, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { CommandProps } from '../../lib/types';
import { PatchNotesConfig } from '../../models/PatchNotesConfig';
import { bug_fixes, date, improvements, new_features, version } from '../../utils/patchNoteTemplate';

export const run = async ({ interaction }: CommandProps) => {
   if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
      await interaction.reply({ content: 'Solo los administradores pueden ejecutar este comando.', ephemeral: true });
      return;
   }

   if (!interaction.guild) {
      await interaction.reply({ content: 'Solo puedes ejecutar este comando en un servidor.', ephemeral: true });
      return;
   }

   try {
      await interaction.deferReply({ ephemeral: true });

      const subcommand = interaction.options.getSubcommand();

      switch (subcommand) {
         case 'set': {
            const channel = interaction.options.getChannel('channel');
            if (!channel) {
               await interaction.editReply('No se ha proporcionado un canal válido.');
               return;
            }
            await PatchNotesConfig.findOneAndUpdate({ guildId: interaction.guildId }, { channelId: channel.id }, { upsert: true, new: true });
            await interaction.editReply(`El canal para los anuncios de notas de parche se ha establecido en <#${channel.id}>.`);
            // VIM command to replace single quotes with backticks for next 20 lines: :.,+20s/'/`/g
            await interaction.followUp({
               content:
                  `📌 Notas del Parche de Mariwano – v${version}\n` +
                  `🗓️ Fecha de lanzamiento: ${date}\n` +
                  `@everyone \n` +
                  `---\n` +
                  `✨ Novedades\n` +
                  `${new_features}\n` +
                  `🛠️ Mejoras\n` +
                  `${improvements}\n` +
                  `🐛 Correcciones de errores\n` +
                  `${bug_fixes}\n` +
                  `---\n` +
                  `📣 ¡Gracias por vuestro apoyo!\n` +
                  `Si encuentras algún problema o tienes sugerencias, no dudes en compartirlas en el canal correspondiente.\n`,
               ephemeral: true,
            });

            return;
         }
         case `unset`: {
            const deletedConfig = await PatchNotesConfig.findOneAndDelete({ guildId: interaction.guildId });
            if (!deletedConfig) {
               await interaction.editReply(`No había un canal de notas de parche configurado.`);
               return;
            }
            await interaction.editReply('Los anuncios de notas de parche han sido desactivados.');
            return;
         }
         default:
            await interaction.editReply('Subcomando no reconocido.');
            return;
      }
   } catch (error) {
      console.error(`Hubo un error al configurar los patchnotes: ${error}`);
      await interaction.editReply('Ocurrió un error al procesar el comando.');
   }
};

export const data = new SlashCommandBuilder()
   .setName('patchnotes')
   .setDescription('Establece o desactiva el canal para los anuncios de notas de parche de GitHub.')
   .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
   .addSubcommand(subcommand =>
      subcommand
         .setName('set')
         .setDescription('Establece el canal para los anuncios de notas de parche.')
         .addChannelOption(option =>
            option
               .setName('channel')
               .setDescription('El canal para enviar las notas de parche.')
               .addChannelTypes(ChannelType.GuildText)
               .setRequired(true)
         )
   )
   .addSubcommand(subcommand => subcommand.setName('unset').setDescription('Desactiva los anuncios de notas de parche.'));
