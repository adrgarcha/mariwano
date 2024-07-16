import { Interaction } from 'discord.js';
import { CustomClient } from '../../lib/types';

export default async function (interaction: Interaction) {
   if (interaction.isChatInputCommand()) {
      const client = interaction.client as CustomClient;
      const command = client.commands.get(interaction.commandName);

      if (!command) {
         console.error(`No se ha encontrado ningun comando ${interaction.commandName}.`);
         return;
      }

      try {
         await command.run({ client, interaction });
      } catch (error) {
         console.error(error);
         if (interaction.replied || interaction.deferred) {
            await interaction.followUp({
               content: 'Ha ocurrido un error al ejecutar el comando. Intentelo de nuevo más tarde.',
               ephemeral: true,
            });
         } else {
            await interaction.reply({
               content: 'Ha ocurrido un error al ejecutar el comando. Intentelo de nuevo más tarde.',
               ephemeral: true,
            });
         }
      }
   } else if (interaction.isAutocomplete()) {
      const client = interaction.client as CustomClient;
      const command = client.commands.get(interaction.commandName);

      if (!command) {
         console.error(`No command matching ${interaction.commandName} was found.`);
         return;
      }

      if (!command.autocomplete) {
         console.error(`No se ha encontrado la funcion 'autocomplete' para el comando ${interaction.commandName}.`);
         return;
      }

      try {
         await command.autocomplete({ interaction });
      } catch (error) {
         console.error(error);
      }
   } else {
      return;
   }
}
