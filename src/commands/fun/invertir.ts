import { ChatInputCommandInteraction, ApplicationCommandOptionType, SlashCommandBuilder } from 'discord.js';
import { User } from '../../models/User';
import { SlashCommandProps } from 'commandkit';

const factorial = (num: number): number => {
   if (num <= 0) {
      return 1;
   }
   return num * factorial(num - 1);
};

module.exports = {
   run: async ({ interaction }: SlashCommandProps) => {
      if (!interaction.guild) {
         interaction.reply({
            content: 'Solo puedes ejecutar este comando en un servidor.',
            ephemeral: true,
         });
         return;
      }

      const cantidad = interaction.options.get('cantidad')!.value as number;
      const targetUserId = interaction.options.get('usuario')?.value || interaction.member?.user.id;

      try {
         await interaction.deferReply();

         const query = {
            userId: interaction.member?.user.id,
            guildId: interaction.guild.id,
         };
         const targetQuery = {
            userId: targetUserId,
            guildId: interaction.guild.id,
         };

         let user = await User.findOne(query);
         const targetUser = await User.findOne(targetQuery);

         if (!targetUser) {
            interaction.editReply('No se ha encontrado al usuario al que quieres invertir el dinero.');
            return;
         }

         if (user) {
            const userBalance = user.balance;
            if (user.investBankFactor == 0 && cantidad === 0) {
               interaction.editReply(
                  'Invierte en un usuario que esté en un canal. Cuanto más gramos ganéis (y tengáis), más beneficios generáis entre tú y el usuario y más rentable hacéis el canal' +
                     '\n\nCuanto más rentable sea el canal, más gramos se podrán ganar. Si el canal está en déficit, no podréis ganar nada (aunque generéis beneficios) pero podréis sacar al canal del déficit' +
                     '\n\nPara recargar los beneficios/maleficios vuelve a poner el comando /invertir sin opciones. Si sale este mensaje es que no has generado beneficios ni pérdidas'
               );
               return;
            } else if (user.investBankFactor != 0) {
               if (userBalance - user.investBankFactor > 0) {
                  let ganancias =
                     user.invested +
                     (userBalance - user.investBankFactor) * factorial(user.investFactor + 1) +
                     ((userBalance / user.invested) * user.investFactor + 1);
                  interaction.editReply(
                     `Has ganado ${ganancias} a causa de las ganancias del canal.\n\n` +
                        `${user.investFactor < 0 ? 'El canal es más rentable, pero sigue en déficit' : 'El canal ahora es más rentable'}`
                  );
                  user.balance += ganancias;
                  user.investFactor += user.investFactor > 6 ? 0 : 1;
                  if (user.investFactor > 6) user.investFactor = 6;
                  user.investBankFactor = 0;
                  user.invested = 0;

                  await user.save();
                  return;
               } else if (userBalance - user.investBankFactor < 0) {
                  let ganancias = -user.invested - (userBalance - user.investBankFactor) * factorial(Math.abs(user.investFactor));
                  interaction.editReply(
                     `Has perdido ${ganancias > 0 ? ganancias : -ganancias} a causa de las pérdidas del canal.\n\n` +
                        `${user.investFactor < 0 ? 'El canal está ahora en déficit' : 'El canal ahora es menos rentable, pero no está en déficit'}`
                  );
                  user.balance += ganancias;
                  user.investFactor -= 2;
                  user.investBankFactor = 0;
                  user.invested = 0;

                  await user.save();
                  return;
               }
            }
            if (userBalance < 10000 || cantidad < 10000) {
               interaction.editReply(`Como mínimo tienes que invertir 10 000 gramos de cocaína.`);
               return;
            } else if (cantidad > 10000000) {
               interaction.editReply(`No puedes invertir mas de 10000000 gramos, si no sale rentable podrías quedarte en banca rota.`);
               return;
            }
         } else {
            user = new User({
               ...query,
            });
         }

         user.balance -= cantidad;
         await user.save();

         targetUser.invested += cantidad;
         await targetUser.save();

         user.investBankFactor = user.balance;
         user.invested = cantidad;
         await user.save();

         interaction.editReply(`Has invertido ${cantidad} en <#${user.guildId}>`);
      } catch (error) {
         console.error(`Ha ocurrido un error en el commando 'invertir': ${error}`);
      }
   },
   data: new SlashCommandBuilder()
      .setName('invertir')
      .setDescription('Invierte en un usuario que esté en un canal para maximizar beneficios')
      .addUserOption(option => option.setName('usuario').setDescription('El usuario que quieres que quieres invertir.'))
      .addIntegerOption(option =>
         option.setName('cantidad').setDescription('La cantidad de dinero que vas a invertir. Tiene que ser más de 10 000.').setRequired(true)
      ),
};
