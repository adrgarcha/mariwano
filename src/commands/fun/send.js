const { ApplicationCommandOptionType } = require("discord.js");

module.exports = {
  run: async ({ interaction }) => {
    
    const usuario = interaction.options.getMentionable("usuario");
    const textoStr = interaction.options.getString("texto");

    await interaction.reply("Enviando mensaje...");
    try{
        await usuario.send(textoStr);
    }catch(e){
        await interaction.editReply("Error: " + e);
    }
  },
  data: {
    name: "send",
    description: 'El bot envia un mensaje por privado al usuario',
    options: [
        {
            name: "texto",
            description: "texto que se enviara a la persona",
            type: ApplicationCommandOptionType.String,
            required: true,
        },
        {
            name: "usuario",
            description: "usuario al que quieres enviar el mensaje",
            type: ApplicationCommandOptionType.Mentionable,
            required: true,
        }
    ]
  },
};
