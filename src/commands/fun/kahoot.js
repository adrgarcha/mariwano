const { ChatInputCommandInteraction, EmbedBuilder } = require("discord.js");
const User = require("../../models/User");

var preguntas = {
    pregunta1: {
        pregunta: "¿Cuál es el nombre original de Godfrey?",
        respuesta: "Hoarah Lorux",
        r1: "Malenia",
        r2: "Horux Lorux",
        r3: "JPelirrojo",
    },
    pregunta2: {
        pregunta: "¿Qué ocurre si no aciertas esta pregunta?",
        respuesta: "No gano cocaina",
        r1: "Se me quema la casa",
        r2: "Mojang me notifica que no emigraste la cuenta a Microsoft",
        r3: "Me hacen tp a latinoamérica",
    },
    pregunta3: {
        pregunta: "¿Qué dinero tenía Porreria en el banco cuando el admin baneó a Porrero, en lingotes de oro?",
        respuesta: "30000",
        r1: "122600",
        r2: "7100",
        r3: "Nada",
    }, 
    pregunta4: {
        pregunta: "¿Quién causó la segunda guerra mundial?",
        respuesta: "Hitler",
        r1: "Mi padre borracho",
        r2: "Churchill",
        r3: "Un francés",
    },
    pregunta5: {
        pregunta: "¿Cuáles son los países que saqueó Porrero en mcatlas (cuyo saqueo provocó que el admin lo banease)?",
        respuesta: "Irlanda y Cuba",
        r1: "Benín, Burkina Faso, Cabo Verde, Costa de Marfil, Gambia, Ghana, Guinea, Guinea-Bissau, Liberia, Mali, Níger, Nigeria, Senegal, Sierra Leona, Togo, Comoras, Yibuti, Etiopía, Eritrea, Kenia, Madagascar, Mauricio, Uganda, Ruanda, Seychelles, Somalia, Sudán del Sur, Sudán y Tanzania",
        r2: "Francia y Reino Unido",
        r3: "Marruecos y Polonia",
    },
    pregunta6: {
      pregunta: "¿Qué carrera estudió Jordi Wild?",
      respuesta: "Psicología",
      r1:"Pornografía",
      r2:"Filología",
      r3:"Magisterio",
    }
}
// funciones necesarias:
// ordenar los elementos de un array aleatoriamente
function shuffle(array) {
    let currentIndex = array.length,  randomIndex;
    while (currentIndex > 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
  }
// escoger una propiedad de un objeto aleatoriamente
  function randomProperty(obj) {
    var keys = Object.keys(obj);
    return obj[keys[ keys.length * Math.random() << 0]];
};
// fin funciones
module.exports = {
  /**
   *
   * @param {Object} param0
   * @param {ChatInputCommandInteraction} param0.interaction
   */
  run: async ({ interaction }) => {
    if (!interaction.inGuild) {
      interaction.reply({
        content: "Solo puedes ejecutar este comando en un servidor.",
        ephemeral: true,
      });
      return;
    }

    try {
        var acertado = false;
        var botPr = randomProperty(preguntas);
      let query = {
        userId: interaction.member.id,
        guildId: interaction.guild.id,
      };
      
      let user = await User.findOne(query);

      if (user) {
        const respuestasReply = [botPr.respuesta,botPr.r1,botPr.r2,botPr.r3];
        const respuestasDef = shuffle(respuestasReply);

        
        let leaderboardEmbed = new EmbedBuilder()
      .setTitle(`${botPr.pregunta}`)
      .setColor(0x45d6fd)
      .setFooter({ text: "Escribe en tu siguiente mensaje la respuesta y no la letra (da igual si es mayúsculas o minúsculas)" });

        var data = "";
        for(var i = 0; i < respuestasReply.length; i++){
            data += ("\n" + String.fromCharCode(i+65) + ") " + respuestasDef[i]);
        }
        leaderboardEmbed.setDescription(data);

        await interaction.reply({ embeds: [leaderboardEmbed] });
        const filter = (response) => response.author.id === interaction.member.id;
        const collector = interaction.channel.createMessageCollector({
          filter,
          time: 15000, // Tiempo en milisegundos (15 segundos )
        });
    
        collector.on('collect', (response) => {
          const respuestaUsuario = response.content;
    
          if (respuestaUsuario.toLowerCase().includes(botPr.respuesta.toLowerCase())) {
            interaction.followUp('¡Respuesta correcta!');
            user.balance += 175;
          
            user.save();
    
            interaction.followUp(
            `175 gramos de cocaína fueron agregadas a tu inventario. Ahora mismo tienes ${user.balance}`
          );
          acertado = false;
            acertado = true;
            
          } else {
            interaction.followUp(`Perdiste. La respuesta correcta era ${botPr.respuesta}.`);
             return;
          }
    
          collector.stop(); // Detener el colector después de la respuesta del usuario
        });
    
        collector.on('end', (collected, reason) => {
          if (reason === 'time') {
            interaction.followUp('¡Tiempo agotado!');
              
            return;
          }
        });

        
      } else {
        user = new User({
          ...query,
          lastDaily: new Date(),
        });
      }
        
      
    } catch (error) {
      console.log(`Ha ocurrido un error con el kahoot: ${error}`);
    }
  },
  data: {
    name: "kahoot",
    description: "Si aciertas una pregunta de cultura clásica, serás recompensado con gramos de cocaina",
  },
};
