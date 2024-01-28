const {
    ChatInputCommandInteraction,
    EmbedBuilder,
    ApplicationCommandOptionType,
  } = require("discord.js");
  
  const User = require("../../models/User");
  

module.exports = {
  /**
   *
   * @param {Object} param0
   * @param {ChatInputCommandInteraction} param0.interaction
   */
  run: async ({ interaction }) => {
    try {
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
          balance: 0,
        });
      } else {
        var palos = ["C","D","T","P"];
var cartas = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
var baraja = [];
//Poblar la baraja
for(var i = 0; i < palos.length; i++ ){
  for(var j = 0; j < cartas.length; j++){
    baraja.push(cartas[j] + palos[i]);
  }  
}
const balance = user.balance;
var Croupier = {};
Croupier.mano = [];
Croupier.daCarta = function (miMano, suMano){
  //Coger una carta aleatoriamente
  function barajar(){return Math.floor(Math.random()*52)};
  var cartaAleatoria = baraja[barajar()];
  //Evitar cartas repetidas
    if(miMano.includes(cartaAleatoria) || suMano.includes(cartaAleatoria) ){
      Croupier.daCarta;
    } else {
      miMano.push(cartaAleatoria);
    }
 }


Croupier.puntua = function (mano){
  var puntuacion = 0;
  for(var i = 0; i < mano.length; i++){
    if(mano[i][0] === "A") {
      puntuacion += 11;
    } else if (mano[i][0] === "J" || mano[i][0] === "Q" || mano[i][0] === "K"){
      puntuacion += 10;
    } else {
      puntuacion += parseInt(mano[i]);
    }
  }
  return puntuacion;  
}

var Jugador = {}
Jugador.mano = [];

var resultadoFinal = "";
//auto ejecutar funcion con el juego.
(function blackJack (){
    
  var miJugador = Jugador;
  var croupier = Croupier;
  
  
  while(croupier.puntua(miJugador.mano) < 19){
    croupier.daCarta(miJugador.mano, croupier.mano);
  }
  
  while(croupier.puntua(croupier.mano) < 19){
    croupier.daCarta(croupier.mano, miJugador.mano);
  }
 
resultadoFinal +="\n" + ("Mano jugador " + miJugador.mano + " | Puntuaje: " + croupier.puntua(miJugador.mano));
  resultadoFinal +="\n" +"---------------\n" + ("Mano croupier " + croupier.mano + "| Puntuaje: " + croupier.puntua(croupier.mano));
  
  if(croupier.puntua(miJugador.mano) > 21 && croupier.puntua(croupier.mano) > 21 ){
      resultadoFinal += "\n"+("Draw");
  } else if(croupier.puntua(miJugador.mano) > 21 && croupier.puntua(croupier.mano) <= 21 ){
    resultadoFinal += "\n"+("Player Loose");
  } else if(croupier.puntua(miJugador.mano) <= 21 && croupier.puntua(croupier.mano) > 21 ){
    resultadoFinal += "\n"+("Player Wins");
  } else if(croupier.puntua(miJugador.mano) < croupier.puntua(croupier.mano)){
    resultadoFinal += "\n"+("Player Loose");
  } else if(croupier.puntua(miJugador.mano) == croupier.puntua(croupier.mano)){
    resultadoFinal += "\n"+("Draw");
  } else if(croupier.puntua(miJugador.mano) > croupier.puntua(croupier.mano)){
    resultadoFinal += "\n"+("Player Wins");
  }
  
}());

let leaderboardEmbed = new EmbedBuilder()
        .setTitle(resultadoFinal)
        .setColor(0x45d6fd)
        .setFooter({
          text: "Modo auto",
        });
        await interaction.reply({ embeds: [leaderboardEmbed] });
        if(resultadoFinal.split("\n")[resultadoFinal.split("\n").length - 1].toLowerCase().includes("wins")){
          interaction.followUp("Has ganado 15€");
        }
      }
    } catch (e) {
      interaction.editReply("Error: " + e.message);
    }
  },
  data: {
    name: "blackjack",
    description: "Gana y pierde dinero REAL jugando al Blackjack original",
  },
};
