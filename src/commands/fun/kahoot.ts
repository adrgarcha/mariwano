import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { KahootQuestion, kahootQuestions } from '../../data/kahootQuestions';
import { CommandProps } from '../../lib/types';
import { User } from '../../models/User';

const shuffle = (array: string[]) => {
   let currentIndex = array.length,
      randomIndex;
   while (currentIndex > 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
   }

   return array;
};

const getRandomQuestion = (questions: KahootQuestion[], hardcore: boolean): KahootQuestion => {
   const filteredQuestions = hardcore ? questions.filter(q => q.dificultad > 1) : questions;
   const randomIndex = Math.floor(Math.random() * filteredQuestions.length);
   return filteredQuestions[randomIndex];
};

export const run = async ({ interaction }: CommandProps) => {
   if (!interaction.guild) {
      interaction.reply({
         content: 'Solo puedes ejecutar este comando en un servidor.',
         ephemeral: true,
      });
      return;
   }

   try {
      let hardcore = interaction.options.getBoolean('hardcore');
      if (!hardcore) hardcore = false;

      const botPr = getRandomQuestion(kahootQuestions, hardcore);
      const query = {
         userId: interaction.member?.user.id,
         guildId: interaction.guild.id,
      };

      let user = await User.findOne(query);

      if (user) {
         const lastKahootDate = user.lastKahoot.toDateString();
         const currentDate = new Date().toDateString();
         const kahootUserCount = user.kahootLimit;

         if (lastKahootDate !== currentDate) {
            user.kahootLimit = 5;
            await user.save();
         }

         if (kahootUserCount <= 0) {
            interaction.reply({
               content: `Has excedido el límite de preguntas por hoy. El límite diario es de 5 preguntas`,
               ephemeral: true,
            });
            return;
         }
      } else {
         user = new User({
            ...query,
            lastKahoot: new Date(),
            kahootLimit: 5,
         });
      }

      const respuestasReply = [botPr.respuesta, botPr.r1, botPr.r2, botPr.r3];
      const respuestasDef = shuffle(respuestasReply);
      user.kahootLimit -= 1;
      user.lastKahoot = new Date();
      await user.save();

      const leaderboardEmbed = new EmbedBuilder().setTitle(`${botPr.pregunta}`).setColor(0x45d6fd).setFooter({
         text: 'Escribe en tu siguiente mensaje la respuesta y no la letra (da igual si es mayúsculas o minúsculas)',
      });

      let data = '';
      for (let i = 0; i < respuestasReply.length; i++) {
         data += '\n' + String.fromCharCode(i + 65) + ') ' + respuestasDef[i];
      }
      leaderboardEmbed.setDescription(data);

      await interaction.reply({ embeds: [leaderboardEmbed] });
      const collector = interaction.channel!.createMessageComponentCollector({
         filter: response => response.user.id === interaction.member?.user.id,
         time: 15000,
      });

      collector.on('collect', interaction => {
         const respuestaUsuario = interaction.message.content;

         if (respuestaUsuario.toLowerCase().trim().includes(botPr.respuesta.trim().toLowerCase())) {
            const amountWon = 175 * botPr.dificultad;
            user.balance += amountWon;
            user.save();

            interaction.followUp(`¡Respuesta correcta! | ${amountWon} gramos de cocaína fueron agregadas a tu inventario.`);
         } else {
            interaction.followUp(`Perdiste. Ahora sabes cuál no es la correcta socio`);
         }

         collector.stop();
         return;
      });

      collector.on('end', (_, reason) => {
         if (reason === 'time') {
            interaction.followUp({
               content: '¡Tiempo agotado!',
               ephemeral: true,
            });
            return;
         }
      });
   } catch (error) {
      console.error(`Ha ocurrido un error con el comando 'kahoot': ${error}`);
   }
};

export const data = new SlashCommandBuilder()
   .setName('kahoot')
   .setDescription('Si aciertas una pregunta de cultura clásica, serás recompensado con gramos de cocaina')
   .addBooleanOption(option => option.setName('hardcore').setDescription('Preguntas más difíciles pero ganas más gramos'));
