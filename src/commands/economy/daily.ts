import { InteractionContextType, MessageFlags, SlashCommandBuilder } from 'discord.js';
import { CommandProps } from '../../lib/types';
import { User } from '../../models/User';
import { buildRewardMessage, calculateDailyStreak, getMultiplier } from '../../utils/streak';

const DAILY_BASE_AMOUNT = 1000;

export const run = async ({ interaction }: CommandProps) => {
   try {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

      const query = {
         userId: interaction.member?.user.id,
         guildId: interaction.guild?.id,
      };

      let user = await User.findOne(query);

      const lastDaily = user?.lastDaily;
      const currentStreak = user?.dailyStreak || 0;
      const streakResult = calculateDailyStreak(lastDaily, currentStreak);

      if (!streakResult.canClaim) {
         interaction.editReply(streakResult.message || 'Ya has reclamado tu recompensa diaria hoy.');
         return;
      }

      const newStreak = streakResult.newStreak;
      const multiplier = getMultiplier(newStreak, 'daily');
      const finalAmount = Math.floor(DAILY_BASE_AMOUNT * multiplier);

      if (!user) {
         user = new User({
            ...query,
            lastDaily: new Date(),
            dailyStreak: newStreak,
            balance: finalAmount,
         });
      } else {
         user.balance += finalAmount;
         user.lastDaily = new Date();
         user.dailyStreak = newStreak;
      }

      await user.save();

      const message = buildRewardMessage({
         baseAmount: DAILY_BASE_AMOUNT,
         multiplier,
         finalAmount,
         streak: newStreak,
         balance: user.balance,
         type: 'daily',
      });

      interaction.editReply(message);
   } catch (error) {
      console.error(`Ha ocurrido un error con las diarias: ${error}`);
   }
};

export const data = new SlashCommandBuilder()
   .setName('daily')
   .setDescription('Recolecta tu recompensa diaria.')
   .setContexts([InteractionContextType.Guild]);
