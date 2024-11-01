// @ts-expect-error /** library doesn't contain types */
import { Wordle } from 'discord-gamecord';
import { SlashCommandBuilder } from 'discord.js';
import { CommandProps } from '../../lib/types';
import { User } from '../../models/User';

export const run = async ({ interaction }: CommandProps) => {
   if (!interaction.guild) {
      interaction.reply({
         content: 'Solo puedes ejecutar este comando en un servidor.',
         ephemeral: true,
      });
      return;
   }

   try {
      const query = {
         userId: interaction.member!.user.id,
         guildId: interaction.guild.id,
      };

      let user = await User.findOne(query);

      if (!user) {
         user = new User({
            ...query,
            lastWordle: new Date(),
         });
      } else {
         const lastWordleDate = user.lastWordle.toDateString();
         const currentDate = new Date().toDateString();
         if (lastWordleDate === currentDate) {
            interaction.reply(`Sólo puedes jugar al Wordle una vez al día.`);
            return;
         }
         const Game = new Wordle({
            message: interaction,
            isSlashGame: false,
            embed: {
               title: `Wordle`,
               color: '#00F0F0',
            },
            customWord: null,
            timeoutTime: 60000,
            winMessage: 'Enhorabuena, la respuesta era **{word}**. Si aduanas no se da cuenta mañana te llegará un paquete con el premio',
            loseMessage: 'Vaya paquetazo hermano la respuesta correcta era **{word}**',
            playerOnlyMessage: 'Sólo {player} puede usar estos botones.',
         });

         Game.startGame();
         user.lastWordle = new Date();
         await user.save();
         Game.on('gameOver', () => {
            return;
         });
      }
   } catch (error) {
      console.error(`Hubo un error al ejecutar el comando 'wordle': ${error}`);
   }
};

export const data = new SlashCommandBuilder().setName('wordle').setDescription('Juego de intentar adivinar una palabra de 5 letras en 6 intentos');
