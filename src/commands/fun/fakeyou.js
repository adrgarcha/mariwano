const {
  Client,
  GatewayIntentBits,
  Intents,
  ApplicationCommandOptionType,
} = require("discord.js");
const axios = require("axios");
const fs = require("fs");
const FakeYou = require("fakeyou.js");

module.exports = {
  run: async ({ interaction }) => {
    const textoAVoz = interaction.options.getString("textardo").toString();
    const tipoDeVoz = interaction.options
      .getString("voz")
      .toString()
      .toLowerCase();
    const vocesProhibidas = ["xokas"];
    if (vocesProhibidas.includes(tipoDeVoz.toLowerCase())) {
      interaction.reply("No puedes utilizar esa voz, lo siento");
    }

    /*
    const voices = [
        {
          modelToken: 'TM:7wbtjphx8h8v',
          title: 'Mario Bros Paid Actor',
        },
        // agrega más voces según la respuesta de la solicitud 'GET https://api.fakeyou.com/tts/list'
      ];
      // busca por la voz existente
      const selectedVoice = voices.find(voice => voice.modelToken === voices[tipoDeVoz].modelToken);
      // si la voz no existe entonces a la verga
      if (!selectedVoice) {
        await interaction.reply("Hubo un error al encontrar la voz, la voz " + voices[tipoDeVoz].title + " no está disponible");
        return;
      }
      // parámetros necesarios para realizar la solicitud
      const apiUrl = 'https://api.fakeyou.com/tts/inference';
      const requestData = {
        uuid_idempotency_token: 'entropy',
        tts_model_token: 'TM:7wbtjphx8h8v',
        inference_text: textoAVoz,
      };

      // Realizar una solicitud a la API de "fakeyou" 
      axios.post(apiEndpoint, requestData, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      })
        .then(response => {
          // la respuesta de la solicitud se almacena en response.data pero esto aún no es el audio
          /*
          van a haber 2 variables en el json de response.data y son:

          "success": un valor booleano que indica si LA SOLICITUD se ha enviado con éxito

          "inference_job_token": un string con un token para realizar otra solicitud


          
          
          const jsonResponse = response.data;
          console.log('Respuesta JSON:', jsonResponse);
        })
        .catch(error => {
          interaction.followUp('Error al realizar la solicitud:', error);
        });
*/
    const FakeYou = require("fakeyou.js");
    const fy = new FakeYou.Client({
      usernameOrEmail: "porrazo",
      password: "code100Todo",
    });
    await fy.start(); //required
    let model = fy.searchModel(tipoDeVoz).first();
    if (!model) {
      interaction.reply("Ha ocurrido un error: modelo no encontrado");
    }
    interaction.reply("Cargando el audio");

    const result = await model.request(textoAVoz);
    //await interaction.followUp(result.audioURL());

    const audioBuffer = Buffer.from(await result.getAudio(), "binary");
    fs.writeFileSync("tts_audio.mp3", audioBuffer);

    await interaction.followUp({
      files: ["tts_audio.mp3"],
    });
  },
  data: {
    name: "fakeyou",
    description: "Genera un audio con la voz de tu youtuber favorito",
    options: [
      {
        name: "voz",
        description:
          "Pon el nombre de la persona que quieres que recite el texto, dan igual las mayúsculas o cómo lo escribas, el bot escogerá el primer resultado que encaje con ese nombre",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
      {
        name: "textardo",
        description: "muestra todas las frases ",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },
};
