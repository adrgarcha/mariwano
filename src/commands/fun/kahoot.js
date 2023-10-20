const { ChatInputCommandInteraction } = require("discord.js");
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
        respuesta: "No gano cocaína",
        r1: "Se me quema la casa",
        r2: "Mojang me notifica que no emigré la cuenta a Microsoft",
        r3: "Me hacen tp a latinoamérica",
    },
    pregunta3: {
        pregunta: "¿Qué dinero tenía Porreria en el banco cuando el admin baneó a Porrero, en lingotes de oro?",
        respuesta: "30 000",
        r1: "122 600",
        r2: "7 100",
        r3: "Nada"
    }, 
    pregunta4: {
        pregunta: "¿Quién causó la segunda guerra mundial?",
        respuesta: "Hitler",
        r1: "Mi padre borracho",
        r2: "Churchill",
        r3: "Antonio"
    }
}

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

      let query = {
        userId: interaction.member.id,
        guildId: interaction.guild.id,
      };

      let user = await User.findOne(query);

      if (user) {
        await interaction.reply(preguntas.pregunta2.pregunta);

        const respuestasReply = [preguntas.pregunta2.respuesta,preguntas.pregunta2.r1,preguntas.pregunta2.r2,preguntas.pregunta2.r3];
        const respuestasDef = shuffle(respuestasReply);
        for(var i = 0; i < respuestasReply.length; i++){
            await interaction.followUp("\n" + String.fromCharCode(i+65) + ") " + respuestasDef[i]);
        }
        const filter = (response) => response.author.id === interaction.member.id;
        const collector = interaction.channel.createMessageCollector({
          filter,
          time: 10000, // Tiempo en milisegundos (10 segundos en este caso)
        });
    
        collector.on('collect', (response) => {
          const respuestaUsuario = response.content;
    
          if (respuestaUsuario.toLowerCase().includes(preguntas.pregunta1.respuesta.toLowerCase())) {
            interaction.followUp('¡Respuesta correcta!');
            user.balance += 0;
          
            user.save();
    
            interaction.followUp(
            `0 gramos de cocaína fueron agregadas a tu inventario. Ahora mismo tienes ${user.balance}`
          );
          acertado = false;
            acertado = true;
            
          } else {
            interaction.followUp(`Perdiste. La respuesta correcta era ${preguntas.pregunta1.respuesta}.`);
             return;
          }
    
          collector.stop(); // Detener el colector después de la respuesta del usuario
        });
    
        collector.on('end', (collected, reason) => {
          if (reason === 'time') {
            interaction.followUp('¡Tiempo agotado!');
            maricon();
              
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
