import {
   ActionRowBuilder,
   ComponentType,
   EmbedBuilder,
   SlashCommandBuilder,
   StringSelectMenuBuilder,
   StringSelectMenuInteraction,
   StringSelectMenuOptionBuilder,
} from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { CommandProps } from '../../lib/types';

interface Command {
   data: {
      name: string;
      description: string;
   };
}

const emojis: { [key: string]: string } = {
   admin: '⚙',
   economy: '💰',
   fun: '😂',
   general: '🌐',
   moderation: '🛠',
   music: '🎵',
   rpg: '⚔',
};
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const formatString = (str: string) => `${str[0].toUpperCase()}${str.slice(1).toLowerCase()}`;

export const run = async ({ interaction }: CommandProps) => {
   if (!interaction.guild) {
      interaction.reply({
         content: 'Solo puedes ejecutar este comando en un servidor.',
         ephemeral: true,
      });
      return;
   }

   try {
      const categoryCommands: { [key: string]: Command[] } = {};
      const commandFolders = fs.readdirSync(path.join(__dirname, '..'));

      for (const commandFolder of commandFolders) {
         const commandFiles = fs.readdirSync(path.join(__dirname, `../${commandFolder}`)).filter(file => file.endsWith('.ts'));
         categoryCommands[`${formatString(commandFolder)}`] = [];

         for (const commandFile of commandFiles) {
            const command = await import(`../${commandFolder}/${commandFile}`);

            categoryCommands[`${formatString(commandFolder)}`].push(command);
         }
      }

      const helpEmbed = new EmbedBuilder().setDescription('Por favor eliga una categoría en el menú desplegable.');

      const components = (state: boolean) => [
         new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            new StringSelectMenuBuilder()
               .setCustomId('help-menu')
               .setPlaceholder('Seleccione una categoría')
               .setDisabled(state)
               .addOptions(
                  Object.keys(categoryCommands).map(category => {
                     return new StringSelectMenuOptionBuilder()
                        .setLabel(category)
                        .setValue(category.toLowerCase())
                        .setDescription(`Comandos de la categoría ${category}`)
                        .setEmoji(emojis[category.toLowerCase()] || '❓');
                  })
               )
         ),
      ];

      const initialMessage = await interaction.reply({
         embeds: [helpEmbed],
         components: components(false),
         ephemeral: true,
      });

      const filter = (interaction: StringSelectMenuInteraction) => interaction.user.id === interaction.member?.user.id;

      const collector = interaction.channel!.createMessageComponentCollector({
         filter,
         componentType: ComponentType.StringSelect,
      });

      collector.on('collect', interaction => {
         const [directory] = interaction.values;
         const category = Object.keys(categoryCommands).find(category => category.toLowerCase() === directory) as string;

         const categoryEmbed = new EmbedBuilder()
            .setTitle(`Comandos de ${formatString(directory)}`)
            .setDescription(`Una lista de todos los comandos dentro de la categoría ${directory}`)
            .addFields(
               categoryCommands[category].map(command => {
                  return {
                     name: `\`${command.data.name}\``,
                     value: command.data.description,
                     inline: true,
                  };
               })
            );

         interaction.update({ embeds: [categoryEmbed] });
      });

      collector.on('end', () => {
         initialMessage.edit({ components: components(true) });
      });
   } catch (error) {
      console.error(`Hubo un error al ejecutar el comando 'help': ${error}`);
   }
};

export const data = new SlashCommandBuilder().setName('help').setDescription('Muestra todos los comandos disponibles para el bot.');
