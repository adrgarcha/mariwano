const {ApplicationCommandOptionType} = require('discord.js');
module.exports = {
  run: async ({ interaction }) => {
    await interaction.reply("Tenga cuidado con el consumo de cannabis, un sólo porro contiene:\n"+
    "\n· Crotolamo\n"+
    "· Aboreo\n"+
    "· Acudo\n"+
    "· Nifo\n"+
    "· Uxiono\n"+
    "· Trujo\n"+
    "· Permatrago\n"+
    "· Padalustro\n"+
    "· Orbo\n"+
    "· Tiro\n"+
    "· Primo\n"+
    "· Obo\n"+
    "· Oplo\n"+
    "· Crotofroto\n"+
    "· Tampo\n"+
    "· Timulo\n"+
    "· Cupo\n"+
    "· Combro\n");
  },
  data: {
    name: "padalustro",
    description: 'padalustro',
  },
};
