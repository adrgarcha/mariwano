import { SlashCommandBuilder } from 'discord.js';
import { CommandProps } from '../../lib/types';
import { User } from '../../models/User';

const dailyAmount = 1000;

export const run = async ({ interaction }: CommandProps) => {
   if (!interaction.guild) {
      interaction.reply({
         content: 'Solo puedes ejecutar este comando en un servidor.',
         ephemeral: true,
      });
      return;
   }

   try {
      await interaction.deferReply({ ephemeral: true });

      const query = {
         userId: interaction.member?.user.id,
         guildId: interaction.guild?.id,
      };

      let user = await User.findOne(query);

      if (user) {
         const lastDailyDate = user.lastDaily.toDateString();
         const currentDate = new Date().toDateString();
         if (lastDailyDate === currentDate) {
            interaction.editReply(`Ya has recolectado las diarias de hoy.`);
            return;
         }
      } else {
         user = new User({
            ...query,
            lastDaily: new Date(),
         });
      }

      user.balance += dailyAmount;
      user.lastDaily = new Date();
      await user.save();

      interaction.editReply(`${dailyAmount} gramos de cocaína fueron agregadas a tu inventario. Ahora mismo tienes ${user.balance}`);
   } catch (error) {
      console.error(`Ha ocurrido un error con las diarias: ${error}`);
   }
};

export const data = new SlashCommandBuilder().setName('daily').setDescription('Recolecta tus diarias.');
