import {
   ActionRowBuilder,
   ButtonBuilder,
   ButtonStyle,
   EmbedBuilder,
   ModalBuilder,
   ModalSubmitInteraction,
   SlashCommandBuilder,
   TextInputBuilder,
   TextInputStyle,
} from 'discord.js';
import { CommandProps } from '../../lib/types';
import { GuildConfiguration } from '../../models/GuildConfiguration';
import { Suggestion } from '../../models/Suggestion';

export const run = async ({ interaction }: CommandProps) => {
   if (!interaction.guild) {
      interaction.reply({
         content: 'Solo puedes ejecutar este comando en un servidor.',
         ephemeral: true,
      });
      return;
   }

   try {
      const guildConfiguration = await GuildConfiguration.findOne({
         guildId: interaction.guildId,
      });
      if (!guildConfiguration?.suggestionChannelIds.length) {
         await interaction.reply({
            content: `Este servidor todavia no ha sido configurado con un canal de sugerencias.`,
            ephemeral: true,
         });
         return;
      }

      if (!guildConfiguration.suggestionChannelIds.includes(interaction.channelId)) {
         await interaction.reply({
            content: `Este canal no se ha configurado como canal de sugerencias.\nUsa uno de estos canales en su lugar: ${guildConfiguration.suggestionChannelIds
               .map(id => `<#${id}>`)
               .join(', ')}`,
            ephemeral: true,
         });
         return;
      }

      const modal = new ModalBuilder().setTitle('Crear una sugerencia').setCustomId(`suggestion-${interaction.user.id}`);

      const textInput = new TextInputBuilder()
         .setCustomId('suggestion-input')
         .setLabel('¿Cuál es tu sugerencia?')
         .setStyle(TextInputStyle.Paragraph)
         .setRequired(true)
         .setMaxLength(1000);

      const actionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(textInput);

      modal.addComponents(actionRow);

      await interaction.showModal(modal);

      const filter = (i: ModalSubmitInteraction) => i.customId === `suggestion-${interaction.user.id}`;

      const modalInteraction = (await interaction
         .awaitModalSubmit({
            filter,
            time: 1000 * 60 * 3, // 3min
         })
         .catch(error => console.error(`Hubo un error en las sugerencias: ${error}`))) as ModalSubmitInteraction;

      await modalInteraction.deferReply({ ephemeral: true });

      let suggestionMessage;

      try {
         suggestionMessage = await interaction.channel!.send('Creando la sugerencia, por favor espere...');
      } catch (error) {
         modalInteraction.editReply('Fallo al crear la sugerencia en este canal. Puede que no tenga suficientes permisos.');
         return;
      }

      const suggestionText = modalInteraction.fields.getTextInputValue('suggestion-input');

      const newSuggestion = new Suggestion({
         authorId: interaction.user.id,
         guildId: interaction.guildId,
         messageId: suggestionMessage.id,
         content: suggestionText,
      });

      await newSuggestion.save();

      modalInteraction.editReply('Sugerencia creada 💬');

      const suggestionEmbed = new EmbedBuilder()
         .setAuthor({
            name: interaction.user.username,
            iconURL: interaction.user.displayAvatarURL({ size: 256 }),
         })
         .addFields([
            { name: 'Sugerencia', value: suggestionText },
            { name: 'Estado', value: '⏳ En espera' },
            {
               name: 'Votos',
               value: `A favor: ${newSuggestion.upvotes.length} | En contra: ${newSuggestion.downvotes.length}`,
            },
         ])
         .setColor('Yellow');

      const upvoteButton = new ButtonBuilder()
         .setEmoji('👍')
         .setLabel('A favor')
         .setStyle(ButtonStyle.Primary)
         .setCustomId(`suggestion.${newSuggestion.suggestionId}.upvote`);

      const downvoteButton = new ButtonBuilder()
         .setEmoji('👎')
         .setLabel('En contra')
         .setStyle(ButtonStyle.Primary)
         .setCustomId(`suggestion.${newSuggestion.suggestionId}.downvote`);

      const approveButton = new ButtonBuilder()
         .setEmoji('✅')
         .setLabel('Aprobar')
         .setStyle(ButtonStyle.Success)
         .setCustomId(`suggestion.${newSuggestion.suggestionId}.approve`);

      const rejectButton = new ButtonBuilder()
         .setEmoji('🗑')
         .setLabel('Rechazar')
         .setStyle(ButtonStyle.Danger)
         .setCustomId(`suggestion.${newSuggestion.suggestionId}.reject`);

      const firstRow = new ActionRowBuilder<ButtonBuilder>().addComponents(upvoteButton, downvoteButton);
      const secondRow = new ActionRowBuilder<ButtonBuilder>().addComponents(approveButton, rejectButton);

      suggestionMessage.edit({
         content: `${interaction.user} Sugerencia creada.`,
         embeds: [suggestionEmbed],
         components: [firstRow, secondRow],
      });
   } catch (error) {
      console.error(`Hubo un error al crear una sugerencia: ${error}`);
   }
};

export const data = new SlashCommandBuilder().setName('suggest').setDescription('Crear una sugerencia.').setDMPermission(false);
