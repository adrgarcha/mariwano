import { InteractionContextType, MessageFlags, SlashCommandBuilder } from 'discord.js';
import { CommandProps } from '../../lib/types';
import { User } from '../../models/User';

const WEEKLY_AMOUNT = 5000;
const WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;

export const run = async ({ interaction }: CommandProps) => {
   try {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

      const query = {
         userId: interaction.member?.user.id,
         guildId: interaction.guild?.id,
      };

      let user = await User.findOne(query);

      if (user) {
         const now = new Date();
         const lastWeekly = user.lastWeekly;
         const timeDiff = now.getTime() - lastWeekly.getTime();

         if (timeDiff < WEEK_IN_MS) {
            const remaining = WEEK_IN_MS - timeDiff;
            const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
            const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
            const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));

            interaction.editReply(`Debes esperar ${days}d ${hours}h ${minutes}m para reclamar tu recompensa semanal.`);
            return;
         }
      } else {
         user = new User({
            ...query,
            lastWeekly: new Date(),
         });
      }

      user.balance += WEEKLY_AMOUNT;
      user.lastWeekly = new Date();
      await user.save();

      interaction.editReply(`${WEEKLY_AMOUNT} gramos de cocaína fueron agregadas a tu inventario. Ahora mismo tienes ${user.balance}`);
   } catch (error) {
      console.error(`Ha ocurrido un error con las semanales: ${error}`);
   }
};

export const data = new SlashCommandBuilder()
   .setName('weekly')
   .setDescription('Recolecta tu recompensa semanal.')
   .setContexts([InteractionContextType.Guild]);
