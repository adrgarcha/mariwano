const { Wordle } = require('discord-gamecord');
const { SlashCommandBuilder } = require('discord.js');


module.exports = {
  run: async ({ interaction }) => {
    if (!interaction.inGuild) {
      interaction.reply({
        content: "Solo puedes ejecutar este comando en un servidor.",
        ephemeral: true,
      });
      return;
    }
    let query = {
      userId: interaction.member.id,
      guildId: interaction.guild.id,
    };

    let user = await User.findOne(query);

    if (!user) {
      user = new User({
        ...query,
        lastDaily: new Date(),
      });
    } else {
      const lastWordleDate = user.lastWordle.toDateString();
      const currentDate = new Date().toDateString();
      if (lastWordleDate === currentDate) {
        interaction.editReply(`Ya has recolectado las diarias de hoy.`);
        return;
      }
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
    user.lastWordle = new Date();
    await user.save();
    Game.on('gameOver', result => {
      return;
    })
  }
  },
  data: {
    name: "wordle",
    description: "Juego de intentar adivinar una palabra de 5 letras en 6 intentos",
  },
};