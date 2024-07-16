import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
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
      let query = {
         userId: interaction.member?.user.id,
         guildId: interaction.guild.id,
      };

      let user = await User.findOne(query);
      if (!user) {
         user = new User({
            ...query,
            balance: 0,
         });
      } else {
         const palos = ['C', 'D', 'T', 'P'];
         const cartas = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
         let baraja: string[] = [];
         for (let i = 0; i < palos.length; i++) {
            for (let j = 0; j < cartas.length; j++) {
               baraja.push(cartas[j] + palos[i]);
            }
         }
         // const balance = user.balance;
         const Croupier = {
            mano: [],
            daCarta: (miMano: string[], suMano: string[]) => {
               const barajar = () => Math.floor(Math.random() * 52);
               let cartaAleatoria = baraja[barajar()];
               if (miMano.includes(cartaAleatoria) || suMano.includes(cartaAleatoria)) {
                  Croupier.daCarta;
               } else {
                  miMano.push(cartaAleatoria);
               }
            },
            puntua: (mano: string[]) => {
               let puntuacion = 0;
               for (let i = 0; i < mano.length; i++) {
                  if (mano[i][0] === 'A') {
                     puntuacion += 11;
                  } else if (mano[i][0] === 'J' || mano[i][0] === 'Q' || mano[i][0] === 'K') {
                     puntuacion += 10;
                  } else {
                     puntuacion += parseInt(mano[i]);
                  }
               }
               return puntuacion;
            },
         };

         const Jugador = {
            mano: [],
         };

         let resultadoFinal = '';
         (() => {
            let miJugador = Jugador;
            let croupier = Croupier;

            while (croupier.puntua(miJugador.mano) < 19) {
               croupier.daCarta(miJugador.mano, croupier.mano);
            }

            while (croupier.puntua(croupier.mano) < 19) {
               croupier.daCarta(croupier.mano, miJugador.mano);
            }

            resultadoFinal += '\n' + ('Mano jugador ' + miJugador.mano + ' | Puntuaje: ' + croupier.puntua(miJugador.mano));
            resultadoFinal += '\n' + '---------------\n' + ('Mano croupier ' + croupier.mano + '| Puntuaje: ' + croupier.puntua(croupier.mano));

            if (croupier.puntua(miJugador.mano) > 21 && croupier.puntua(croupier.mano) > 21) {
               resultadoFinal += '\n' + 'Draw';
            } else if (croupier.puntua(miJugador.mano) > 21 && croupier.puntua(croupier.mano) <= 21) {
               resultadoFinal += '\n' + 'Player Loose';
            } else if (croupier.puntua(miJugador.mano) <= 21 && croupier.puntua(croupier.mano) > 21) {
               resultadoFinal += '\n' + 'Player Wins';
            } else if (croupier.puntua(miJugador.mano) < croupier.puntua(croupier.mano)) {
               resultadoFinal += '\n' + 'Player Loose';
            } else if (croupier.puntua(miJugador.mano) == croupier.puntua(croupier.mano)) {
               resultadoFinal += '\n' + 'Draw';
            } else if (croupier.puntua(miJugador.mano) > croupier.puntua(croupier.mano)) {
               resultadoFinal += '\n' + 'Player Wins';
            }
         })();

         let leaderboardEmbed = new EmbedBuilder().setTitle(resultadoFinal).setColor(0x45d6fd).setFooter({
            text: 'Modo auto',
         });
         await interaction.reply({ embeds: [leaderboardEmbed] });
         if (resultadoFinal.split('\n')[resultadoFinal.split('\n').length - 1].toLowerCase().includes('wins')) {
            interaction.followUp('Has ganado 15€');
         }
      }
   } catch (error) {
      console.error(`Hubo un error al ejecutar el comando blackjack: ${error}`);
   }
};

export const data = new SlashCommandBuilder().setName('blackjack').setDescription('Gana y pierde dinero REAL jugando al Blackjack original');
