const { ChatInputCommandInteraction,
    ApplicationCommandOptionType } = require("discord.js");
const User = require("../../models/User");
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
    // funciones necesarias
    function factorial(num) {
      if (num <= 0) {
        return 1;
      }
      return num * factorial(num - 1);
    }
    //fin funciones

    var cantidad = isNaN(interaction.options.get("cantidad")?.value) ? 0 : interaction.options.get("cantidad")?.value;
    const targetUserId =
      interaction.options.get("usuario")?.value || interaction.member.id;
    
    try {
      await interaction.deferReply();
       
      let query = {
        userId: interaction.member.id,
        guildId: interaction.guild.id,
      };
      let porrero = {
        userId: targetUserId,
        guildId: interaction.guild.id,
      };
      
      let user = await User.findOne(query);
      let porrazo = await User.findOne(porrero);
      if (user) {
        console.log(`${user.invested},${user.investBankFactor},${user.investFactor}`);
        console.log(`targetUserId: ${targetUserId}`);
        console.log(`cantidad: ${cantidad}`);
        
        const userBalance = user.balance;
        console.log(`balance: ${userBalance}`);
        console.log(user.investBankFactor == 0 && ((cantidad === 0)));
        console.log(user.investBankFactor != 0);
        console.log(( userBalance - user.investBankFactor) > 0);
        console.log(( userBalance - user.investBankFactor) < 0);
        if(user.investBankFactor == 0 && ((cantidad === 0))){
          interaction.editReply("Invierte en un usuario que esté en un canal. Cuanto más gramos ganéis (y tengáis), más beneficios generáis entre tú y el usuario y más rentable hacéis el canal"+
          "\n\nCuanto más rentable sea el canal, más gramos se podrán ganar. Si el canal está en déficit, no podréis ganar nada (aunque generéis beneficios) pero podréis sacar al canal del déficit"+
          "\n\nPara recargar los beneficios/maleficios vuelve a poner el comando /invertir sin opciones. Si sale este mensaje es que no has generado beneficios ni pérdidas");
          return;
        }
        else if(user.investBankFactor != 0){
          if(( userBalance - user.investBankFactor) > 0) {
            var ganancias = user.invested + (userBalance - user.investBankFactor)*(factorial(user.investFactor+1)) + parseInt((user.balance/user.invested)*user.investFactor+1);
            interaction.editReply(`Has ganado ${ganancias} a causa de las ganancias del canal.\n\n`+
            `${user.investFactor < 0 ? "El canal es más rentable, pero sigue en déficit" : "El canal ahora es más rentable"}`);
            user.balance += ganancias;
            user.investFactor += user.investFactor > 6 ? 0 : 1;
            if(user.investFactor > 6) user.investFactor = 6;
            user.investBankFactor = 0;
            user.invested = 0;
  
            await user.save();
            return;
          } else if(( userBalance - user.investBankFactor) < 0) {
            console.log(-user.invested - (userBalance - user.investBankFactor)*(factorial(user.investFactor)));
            var ganancias = -user.invested - (userBalance - user.investBankFactor)*(factorial(Math.abs(user.investFactor)));
            interaction.editReply(`Has perdido ${ganancias > 0 ? ganancias : -ganancias} a causa de las pérdidas del canal.\n\n`+
            `${user.investFactor < 0 ? "El canal está ahora en déficit" : "El canal ahora es menos rentable, pero no está en déficit"}`);
            user.balance += ganancias;
            user.investFactor -= 2;
            user.investBankFactor = 0;
            user.invested = 0;
            
            await user.save();
            return;
          }
        }
        if (userBalance < 10000 || cantidad < 10000) {
          interaction.editReply(`Como mínimo tienes que invertir 10 000 gramos de cocaína.`);
          return;
        }
        else if (cantidad > 10000000){
          interaction.editReply(`No puedes invertir tantos gramos, si no sale rentable podrías quedarte en banca rota.`);
          return;
        }
      } else {
        user = new User({
          ...query,
        });
      }
        
        user.balance -= cantidad;
        await user.save();

        porrazo.invested += cantidad;
        await porrazo.save();

        user.investBankFactor = user.balance;
        user.invested = cantidad;
        await user.save();

        interaction.editReply(`Has invertido ${cantidad} en <#${user.guildId}>`);
      
    } catch (error) {
      console.log(`Ha ocurrido un error: ${error}`);
    }
  },
  data: {
    name: "invertir",
    description: "Dona dinero a alguien. Si aumenta ganancias, tu también y si no, ambos perdéis dinero",
    options: [
        {
            name: "usuario",
            description: "El usuario al que quieres que embolse el dinero",
            type: ApplicationCommandOptionType.Mentionable,
        },
        {
            name: "cantidad",
            description: "La cantidad de dinero que vas a invertir. Tiene que ser más de 10 000",
            type: ApplicationCommandOptionType.Number,
            min_length: 5,
            max_length: 7,
        },
    ],
  },
};
