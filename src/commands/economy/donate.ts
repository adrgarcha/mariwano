import { EmbedBuilder, GuildMember, InteractionContextType, MessageFlags, SlashCommandBuilder } from 'discord.js';
import { CommandProps } from '../../lib/types';
import { Donation } from '../../models/Donation';
import { User } from '../../models/User';
import mongoose from 'mongoose';

export const run = async ({ interaction }: CommandProps) => {
   if (!interaction.guild) {
      await interaction.reply({
         content: 'Solo puedes ejecutar este comando en un servidor.',
         flags: MessageFlags.Ephemeral,
      });
      return;
   }

   try {
      const receiveUser = interaction.options.getMentionable('user') as GuildMember;
      const donateAmount = interaction.options.getInteger('amount')!;
      const donationMessage = interaction.options.getString('message');

      if (receiveUser.id === interaction.user.id) {
         await interaction.reply({
            content: 'No puedes donarte a ti mismo, eso no tiene sentido.',
            flags: MessageFlags.Ephemeral,
         });
         return;
      }

      if (receiveUser.user.bot) {
         await interaction.reply({
            content: 'No puedes donar a un bot.',
            flags: MessageFlags.Ephemeral,
         });
         return;
      }

      if (donateAmount < 1) {
         await interaction.reply({
            content: 'Tienes que donar como mínimo 1 gramo de cocaína. No seas rata.',
            flags: MessageFlags.Ephemeral,
         });
         return;
      }

      const user = await User.findOne({
         userId: interaction.user.id,
         guildId: interaction.guild.id,
      });

      if (!user) {
         await interaction.reply({
            content: 'No estás en el sistema monetario. Prueba a usar el comando /daily.',
            flags: MessageFlags.Ephemeral,
         });
         return;
      }

      if (user.balance < donateAmount) {
         await interaction.reply({
            content: `No tienes ${donateAmount} gramos.`,
            flags: MessageFlags.Ephemeral,
         });
         return;
      }

      const receiveUserData = await User.findOne({
         userId: receiveUser.id,
         guildId: interaction.guild.id,
      });

      if (!receiveUserData) {
         await interaction.reply({
            content: `<@${receiveUser.id}> no está en el sistema monetario.`,
            flags: MessageFlags.Ephemeral,
         });
         return;
      }

      await interaction.deferReply();

      const session = await mongoose.startSession();
      session.startTransaction();

      await User.updateOne({ userId: interaction.user.id, guildId: interaction.guild.id }, { $inc: { balance: -donateAmount } });

      await User.updateOne({ userId: receiveUser.id, guildId: interaction.guild.id }, { $inc: { balance: donateAmount } });

      const donation = new Donation({
         guildId: interaction.guild.id,
         fromUserId: interaction.user.id,
         toUserId: receiveUser.id,
         amount: donateAmount,
         message: donationMessage || '',
      });
      await donation.save();

      await session.commitTransaction();
      session.endSession();

      const donationEmbed = new EmbedBuilder()
         .setTitle('💸 ¡Donación realizada!')
         .setColor(0x2ecc71)
         .setThumbnail(receiveUser.displayAvatarURL({ size: 128 }))
         .addFields(
            { name: '🎁 Donante', value: `<@${interaction.user.id}>`, inline: true },
            { name: '📥 Receptor', value: `<@${receiveUser.id}>`, inline: true },
            { name: '💰 Cantidad', value: `${donateAmount} gramos`, inline: true }
         )
         .setTimestamp()
         .setFooter({ text: `Donación de ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() });

      if (donationMessage) {
         donationEmbed.addFields({ name: '💬 Mensaje', value: donationMessage });
      }

      await interaction.editReply({ embeds: [donationEmbed] });
   } catch (error) {
      console.error(`Ha ocurrido un error con el comando 'donate': ${error}`);
   }
};

export const data = new SlashCommandBuilder()
   .setName('donate')
   .setDescription('Dona gramos de cocaína a otro usuario.')
   .setContexts([InteractionContextType.Guild])
   .addMentionableOption(option => option.setName('user').setDescription('El usuario al que le quieres donar.').setRequired(true))
   .addIntegerOption(option => option.setName('amount').setDescription('La cantidad que le quieres donar.').setRequired(true))
   .addStringOption(option => option.setName('message').setDescription('Mensaje opcional para el receptor (máx. 100 caracteres).').setMaxLength(100));
