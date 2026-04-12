import { InteractionContextType, MessageFlags, SlashCommandBuilder } from 'discord.js';
import mongoose from 'mongoose';
import { CommandProps } from '../../lib/types';
import { Burn } from '../../models/Burn';
import { User } from '../../models/User';
import { getIsoWeekId } from '../../utils/date';

export const run = async ({ interaction }: CommandProps) => {
   if (!interaction.guild) {
      await interaction.reply({
         content: 'Solo puedes ejecutar este comando en un servidor.',
         flags: MessageFlags.Ephemeral,
      });
      return;
   }

   const amount = interaction.options.getInteger('amount', true);
   const guildId = interaction.guild.id;
   const userId = interaction.user.id;

   if (amount < 1) {
      await interaction.reply({
         content: 'Tienes que quemar como mínimo 1 gramo de cocaína.',
         flags: MessageFlags.Ephemeral,
      });
      return;
   }

   const user = await User.findOne({ userId, guildId });

   if (!user) {
      await interaction.reply({
         content: 'No estás en el sistema monetario. Prueba a usar el comando /daily.',
         flags: MessageFlags.Ephemeral,
      });
      return;
   }

   if (user.balance < amount) {
      await interaction.reply({
         content: `No tienes ${amount} gramos para quemar.`,
         flags: MessageFlags.Ephemeral,
      });
      return;
   }

   try {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

      const weekId = getIsoWeekId();

      const session = await mongoose.startSession();
      session.startTransaction();

      await User.updateOne({ userId, guildId }, { $inc: { balance: -amount, totalBurned: amount } }, { session });
      await Burn.create([{ guildId, userId, amount, weekId }], { session });

      await session.commitTransaction();
      session.endSession();

      const updatedUser = await User.findOne({ userId, guildId });

      const weeklyRanking = await Burn.aggregate([
         { $match: { guildId, weekId } },
         { $group: { _id: '$userId', total: { $sum: '$amount' }, firstBurn: { $min: '$createdAt' } } },
         { $sort: { total: -1, firstBurn: 1 } },
      ]);

      const rank = weeklyRanking.findIndex(entry => entry._id === userId) + 1;

      await interaction.editReply({
         content: `🔥 Quemaste **${amount}** gramos. Tu saldo actual es **${updatedUser?.balance ?? 0}** gramos.`,
      });

      await interaction.followUp({
         content: `🔥 <@${userId}> acaba de quemar **${amount}** gramos y ocupa el **#${rank}** en el ranking semanal de derrochadores.`,
      });
   } catch (error) {
      console.error(`Ha ocurrido un error con el comando 'burn': ${error}`);
      await interaction.editReply({ content: 'Hubo un error al procesar la quema de gramos.' });
   }
};

export const data = new SlashCommandBuilder()
   .setName('burn')
   .setDescription('Quema gramos de cocaína voluntariamente.')
   .setContexts([InteractionContextType.Guild])
   .addIntegerOption(option => option.setName('amount').setDescription('La cantidad de gramos que quieres quemar.').setRequired(true).setMinValue(1));
