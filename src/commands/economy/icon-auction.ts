import {
   ActionRowBuilder,
   ButtonBuilder,
   ButtonStyle,
   EmbedBuilder,
   ModalBuilder,
   ModalSubmitInteraction,
   SlashCommandBuilder,
   TextChannel,
   TextInputBuilder,
   TextInputStyle,
} from 'discord.js';
import { CommandProps } from '../../lib/types';
import { Auction } from '../../models/Auction';

export const run = async ({ interaction }: CommandProps) => {
   /**
    * Emite un mensaje en el canal donde se ejecutó el comando con una subasta para cambiar el icono del servidor.
    * El ganador de la subasta podrá subir una imagen que será usada como icono temporal del server. Pasadas las 24h, el icono original se restaurará.
    *
    * Puja mínima: **1000 gramos**.
    *
    * Introduce /icon-auction con la cantidad para aumentar la puja con tu imagen.
    */
   const modal = new ModalBuilder().setTitle('Crear una puja').setCustomId(`auction-${interaction.user.id}`);

   const textInput = new TextInputBuilder()
      .setCustomId('auction-input')
      .setLabel('¿A qué precio quieres empezar la puja?')
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
      .setMaxLength(9);

   const textInput2 = new TextInputBuilder()
      .setCustomId('auction-input2')
      .setLabel('Enlace de la imagen')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true)
      .setMaxLength(1000);

   const actionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(textInput);
   const anotherActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(textInput2);
   modal.addComponents(actionRow);
   modal.addComponents(anotherActionRow);

   await interaction.showModal(modal);

   const filter = (i: ModalSubmitInteraction) => i.customId === `auction-${interaction.user.id}`;

   const modalInteraction = (await interaction
      .awaitModalSubmit({
         filter,
         time: 1000 * 60 * 3, // 3min
      })
      .catch(error => console.error(`Hubo un error en las puestas: ${error}`))) as ModalSubmitInteraction;

   await modalInteraction.deferReply({ ephemeral: true });

   let auctionMessage;

   try {
      auctionMessage = await (interaction.channel as TextChannel).send('Creando la puesta, por favor espere...');
   } catch {
      modalInteraction.editReply('Fallo al crear la puesta en este canal. Puede que no tenga suficientes permisos.');
      return;
   }

   const auctionText = modalInteraction.fields.getTextInputValue('auction-input');
   const auctionImageURL = modalInteraction.fields.getTextInputValue('auction-input2');

   const newAuction = new Auction({
      authorId: interaction.user.id,
      guildId: interaction.guildId,
      messageId: auctionMessage.id,
      content: auctionText,
   });

   await newAuction.save();

   modalInteraction.editReply('Puesta creada 💬');

   const auctionEmbed = new EmbedBuilder()
      .setAuthor({
         name: interaction.user.username,
         iconURL: interaction.user.displayAvatarURL({ size: 256 }),
      })
      .addFields([
         { name: 'Puesta', value: auctionText },
         { name: 'Estado', value: '⏳ En espera' },
      ])
      .setImage(auctionImageURL)
      .setColor('Yellow');

   const approveButton = new ButtonBuilder()
      .setEmoji('🆙')
      .setLabel('Subir puja')
      .setStyle(ButtonStyle.Success)
      .setCustomId(`auction.${newAuction.auctionId}`);

   const rejectButton = new ButtonBuilder()
      .setEmoji('🗑')
      .setLabel('Rechazar')
      .setStyle(ButtonStyle.Danger)
      .setCustomId(`auction.${newAuction.auctionId}.reject`);

   const secondRow = new ActionRowBuilder<ButtonBuilder>().addComponents(approveButton, rejectButton);
   auctionMessage.edit({
      content: `${interaction.user} Puesta creada.`,
      embeds: [auctionEmbed],
      components: [secondRow],
   });
   await interaction.guild?.setIcon(auctionImageURL);
   await interaction.followUp('Imagen establecida.');
};

export const data = new SlashCommandBuilder().setName('icon-auction').setDescription('Subasta para cambiar el icono del servidor');
