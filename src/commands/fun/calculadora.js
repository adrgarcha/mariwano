const { ApplicationCommandOptionType } = require("discord.js");

module.exports = {
  run: async ({ interaction }) => {
    const textoStr = interaction.options.getString("expresion");

    try{
      if(textoStr.includes("while") || textoStr.includes("{") || textoStr.includes("\"") || textoStr.includes(";true;") || textoStr.includes("==") ||textoStr.includes("$")||textoStr.includes("}")){
        throw new Error("Código prohibido");
      }
      await interaction.reply(textoStr + " = " +eval(textoStr));
    } catch(e){
      await interaction.reply("Error al evaluar la expresión matemática, ¿estás seguro que estás usando las expresiones de JavaScript?: "+ e);
    }
    
  },
  data: {
    name: "calculadora",
    description: 'calculadora que usa expresiones de JavaScript',
    options: [
      {
        name: "expresion",
        description: "Usa las expresiones matemáticas de JavaScript",
        type: ApplicationCommandOptionType.String,
      }
    ]
  },
};
