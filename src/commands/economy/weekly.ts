import { InteractionContextType, MessageFlags, SlashCommandBuilder } from 'discord.js';
import { CommandProps } from '../../lib/types';
import { User } from '../../models/User';
import { buildRewardMessage, calculateWeeklyStreak, getMultiplier } from '../../utils/streak';

const WEEKLY_BASE_AMOUNT = 5000;

export const run = async ({ interaction }: CommandProps) => {
   try {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

      const query = {
         userId: interaction.member?.user.id,
         guildId: interaction.guild?.id,
      };

      let user = await User.findOne(query);

      const currentStreak = user?.weeklyStreak || 0;
      const lastWeekly = user?.lastWeekly;

      const streakResult = calculateWeeklyStreak(lastWeekly, currentStreak);

      if (!streakResult.canClaim) {
         interaction.editReply(streakResult.message || 'No puedes reclamar tu recompensa semanal todavía.');
         return;
      }

      if (!user) {
         user = new User({
            ...query,
            lastWeekly: new Date(),
            weeklyStreak: streakResult.newStreak,
         });
      }

      const multiplier = getMultiplier(streakResult.newStreak, 'weekly');
      const finalAmount = Math.floor(WEEKLY_BASE_AMOUNT * multiplier);

      user.balance += finalAmount;
      user.lastWeekly = new Date();
      user.weeklyStreak = streakResult.newStreak;
      await user.save();

      const message = buildRewardMessage({
         baseAmount: WEEKLY_BASE_AMOUNT,
         multiplier,
         finalAmount,
         streak: streakResult.newStreak,
         balance: user.balance,
         type: 'weekly',
      });

      interaction.editReply(message);
   } catch (error) {
      console.error(`Ha ocurrido un error con las semanales: ${error}`);
   }
};

export const data = new SlashCommandBuilder()
   .setName('weekly')
   .setDescription('Recolecta tu recompensa semanal.')
   .setContexts([InteractionContextType.Guild]);
