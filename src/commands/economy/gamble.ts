import { ApplicationCommandOptionType } from 'discord.js';
import { User } from '../../models/User';
import { SlashCommandProps } from 'commandkit';

module.exports = {
   run: async ({ interaction }: SlashCommandProps) => {
      try {
         if (!interaction.guild) {
            interaction.reply({
               content: 'Solo puedes ejecutar este comando en un servidor.',
               ephemeral: true,
            });
            return;
         }

         const amount = interaction.options.get('amount')!.value;

         if (!amount) {
            interaction.reply({
               content: 'Debes especificar la cantidad que vas a apostar.',
               ephemeral: true,
            });
            return;
         }

         if (typeof amount !== 'number') {
            interaction.reply({
               content: 'La cantidad debe ser un número.',
               ephemeral: true,
            });
            return;
         }

         if (amount < 100) {
            interaction.reply({
               content: 'Debes apostar al menos 100 gramos de cocaína.',
               ephemeral: true,
            });
            return;
         }

         let user = await User.findOne({
            userId: interaction.user.id,
            guildId: interaction.guild.id,
         });

         if (!user) {
            user = new User({
               userId: interaction.user.id,
            });
         }

         if (amount > user.balance) {
            interaction.reply({
               content: 'No tienes suficientes gramos de cocaína para apostar.',
               ephemeral: true,
            });
            return;
         }

         const hasWin = Math.random() > 0.5; // 50% de ganar

         if (!hasWin) {
            user.balance -= amount;
            await user.save();

            interaction.reply(
               `No has ganado nada, pero recuerda que el 90% de la gente siempre lo deja antes de recuperarlo todo 🤑.\nAhora mismo tienes ${user.balance} gramos.`
            );
            return;
         }

         const amountWon = Number((amount * (Math.random() + 0.55)).toFixed(0));

         user.balance += amountWon;
         await user.save();

         interaction.reply(`🎉 Has ganado ${amountWon} 🎊.\nAhora mismo tienes ${user.balance} gramos.`);
      } catch (error) {
         console.error(`Ha ocurrido un error con el comando 'gamble': ${error}`);
      }
   },
   data: {
      name: 'gamble',
      description: 'Conviértete en ludópata.',
      options: [
         {
            name: 'amount',
            description: 'La cantidad que vas a apostar.',
            type: ApplicationCommandOptionType.Number,
            required: true,
         },
      ],
   },
};
