const { Wordle } = require('discord-gamecord');
const { SlashCommandBuilder } = require('discord.js');


module.exports = {
  run: async ({ interaction }) => {
    const Game = new Wordle({
      message: interaction,
      isSlashGame: false,
      embed: {
        title: `Wordle`,
        color: '#00F0F0'
      },
      customWord: null,
      timeoutTime: 60000,
      winMessage: 'Enhorabuena, la respuesta era **{word}**. Si aduanas no se da cuenta mañana te llegará un paquete con el premio',
      loseMessage: 'Vaya paquetazo hermano la respuesta correcta era **{word}**',
      playerOnlyMessage: 'Sólo {player} puede usar estos botones.'

    });

    Game.startGame();
    Game.on('gameOver', result => {
      return;
    })
  },
  data: {
    name: "wordle",
    description: "Juego de intentar adivinar una palabra de 5 letras en 6 intentos",
  },
};