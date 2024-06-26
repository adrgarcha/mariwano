const { ApplicationCommandOptionType } = require("discord.js");
const duro = [
  "https://cdn.discordapp.com/attachments/1173170489800261632/1177321167493808158/CUsersalejaOneDriveEscritorioDUROBOTcarpetaF6eOpeNXIAAcSev.webp?ex=657214c7&is=655f9fc7&hm=c6d1290d45904adcdedee5a4fa9554c7ff9e2346b174f0e44d1fc8af83335a9f&",
  "https://cdn.discordapp.com/attachments/1173170489800261632/1177321324658561155/CUsersalejaOneDriveEscritorioDUROBOTcarpetaF74F2HXWMAAjvE2.webp?ex=657214ed&is=655f9fed&hm=65aa0ce388ef7d20282c790a137e9b4abf38bdff2c552721f0d54fe98440c62c&",
  "https://cdn.discordapp.com/attachments/1173170489800261632/1177321356010999920/CUsersalejaOneDriveEscritorioDUROBOTcarpetaF74nVajX0AAm79V.webp?ex=657214f4&is=655f9ff4&hm=22fe4732aabb02c85781f3a2b38123d2cf70e61a45fd4e55986f66f2116ac44b&",
  "https://cdn.discordapp.com/attachments/1173170489800261632/1177321367625019442/CUsersalejaOneDriveEscritorioDUROBOTcarpetaF75lI3gX0AAhH2w.webp?ex=657214f7&is=655f9ff7&hm=1e0c015739b1efad29493c0592c7822210b2c50b6387b9ea962ec21a1f34a25a&",
  "https://cdn.discordapp.com/attachments/1173170489800261632/1177321678284529815/de6cf3omoqpa1.webp?ex=65721541&is=655fa041&hm=1e5790c8c61eb17bdb7a30ed82bd2991f9702ae7d3486ff3da210fb87e60fd7b&	",
  "https://cdn.discordapp.com/attachments/1173170489800261632/1177321644398751914/CUsersalejaOneDriveEscritorioDUROBOTcarpetaphoto.webp?ex=65721539&is=655fa039&hm=610c6cd6dbd414c771fc2fef351d37cca909d3d3b76ed42b568204b3a320c982&",
  "https://cdn.discordapp.com/attachments/1173170489800261632/1177321592385183824/CUsersalejaOneDriveEscritorioDUROBOTcarpetaIMG_20231026_180052.webp?ex=6572152d&is=655fa02d&hm=8cba034d58f7eb84764f9d4cca94369dc9f9fbc4e66517cce62e94b289ff560f&	",
  "https://cdn.discordapp.com/attachments/1173170489800261632/1177321461657120846/CUsersalejaOneDriveEscritorioDUROBOTcarpetaF-hpfAqXMAAvoj3.webp?ex=6572150e&is=655fa00e&hm=659415485da48d4b55e46e4d6743599ffcd0ace42a4160808df43c3f7b13d364&	",
  "https://cdn.discordapp.com/attachments/1173170489800261632/1177321437661515867/CUsersalejaOneDriveEscritorioDUROBOTcarpetaF7333BAXAAAZJOj.webp?ex=65721508&is=655fa008&hm=c3e5020014367098244c42af01b20d926594388912f434e5d6963061dcb121f3&	",
  "https://cdn.discordapp.com/attachments/1173170489800261632/1177321393638097026/CUsersalejaOneDriveEscritorioDUROBOTcarpetaF76U_EXWEAAeA2q.webp?ex=657214fd&is=655f9ffd&hm=3ac12624fd8741d4a4ea4c7b2458db07894557297ed7e2080e0c4de55524ca80&	",
  "https://cdn.discordapp.com/attachments/1173170489800261632/1177321256090079232/CUsersalejaOneDriveEscritorioDUROBOTcarpetaF7IIMiBXYAAYuAx.webp?ex=657214dd&is=655f9fdd&hm=e8080104b934c06afb90ed1b84cf6401e4f1b8a8065bcdc9c75a6e3e5c8ddade&	",
  "https://cdn.discordapp.com/attachments/1173170489800261632/1177321244593496065/CUsersalejaOneDriveEscritorioDUROBOTcarpetaF7IHWd2XAAAaJJ2.webp?ex=657214da&is=655f9fda&hm=0cab567d951e08816a00a5840c1928bf81570fe49ad2662f659db29ffb657805&	",
  "https://cdn.discordapp.com/attachments/1173170489800261632/1177320910865317998/20231122_185434.jpg?ex=6572148a&is=655f9f8a&hm=3dfe9da99605610ed277016d64a59a3cc17bc499f436e3902c6b5213f3b742d5&	",
  "https://cdn.discordapp.com/attachments/1173170489800261632/1177321949542752256/F9JCybDXYAEC3a1.webp?ex=65721582&is=655fa082&hm=13fb3ae59b0a4f8e561836636ce5a46bf3112f61ce3d93a1e9814e2c32a4f56e&	",
  "https://cdn.discordapp.com/attachments/1173170489800261632/1177321971244093461/F9n1R6_XUAAfr0C.webp?ex=65721587&is=655fa087&hm=8839da983a07ef325ae288ab284f54272e8c4f69ee27931cd2f96fa9c430045a&	",
  "https://cdn.discordapp.com/attachments/1173170489800261632/1177321983072014376/F-gCNBobIAAhwT0.webp?ex=6572158a&is=655fa08a&hm=dd7de2f1f2fa7caa2e00a565e102f332b6c7443372dbbe21475345b666d5f8be&",
  "https://cdn.discordapp.com/attachments/1173170489800261632/1177322039271505920/F-xfCmnXcAAfPIG.webp?ex=65721597&is=655fa097&hm=b1c145d105ce6078b2f8d715638df27b2b118d76676350a301bd047aa8266523&	",
  "https://cdn.discordapp.com/attachments/1173170489800261632/1177322992280289350/Untitled.jpeg?ex=6572167a&is=655fa17a&hm=a52738a215b522d5d23fe3b5f1203552744422438265ccc359089eee6807f99a&",
  "https://cdn.discordapp.com/attachments/1173170489800261632/1177322984990580856/skatewhite.png?ex=65721679&is=655fa179&hm=0fc3ffe707cb801977f83c3fabe0061e63ac75fb6a1061c4c9db810f8008c2a7&",
  "https://cdn.discordapp.com/attachments/1173170489800261632/1177322862047154338/latest.webp?ex=6572165b&is=655fa15b&hm=77ca5bde0a947df1ebf1fe6c56647ce584002ad24b33f2a0784f2905662c6428&",
  "https://cdn.discordapp.com/attachments/1173170489800261632/1177322840773623868/IMG-20231023-WA0000.webp?ex=65721656&is=655fa156&hm=325d647c0ed2ec81a6e024995f44c1c5f5e11a62aa75033d054da05fea862572&",
  "https://cdn.discordapp.com/attachments/1173170489800261632/1177322695461965854/IMG-20230507-WA0005.webp?ex=65721634&is=655fa134&hm=4d2750bb314f8957f6d6345579b5e3ba931710773eb6b28f21f35bc04e9d974a&",
  "https://cdn.discordapp.com/attachments/1173170489800261632/1177322517854171297/IMG_20230513_062346.webp?ex=65721609&is=655fa109&hm=c850e6fe0adb1764c00ec6d5814493291064c5092e8211eaf164877baf0a3b9c&",
  "https://cdn.discordapp.com/attachments/1173170489800261632/1177322439378747412/IMG_20211122_162428.webp?ex=657215f7&is=655fa0f7&hm=fab05245cb8c1fa0e2766b4c1a8783600e16e16eb1a020d836f27878c7b4401e&",
  "https://cdn.discordapp.com/attachments/1173170489800261632/1177322379760910346/IMG_20210912_184045.webp?ex=657215e8&is=655fa0e8&hm=2fb0575e24026efe055f592ae89d24061f1992ea85f16fc00aab9c543e6999cb&",
  "https://cdn.discordapp.com/attachments/1173170489800261632/1177322039271505920/F-xfCmnXcAAfPIG.webp?ex=65721597&is=655fa097&hm=b1c145d105ce6078b2f8d715638df27b2b118d76676350a301bd047aa8266523&",
  "https://cdn.discordapp.com/attachments/1173170489800261632/1177321992479834132/FK768rIXEAAg2xa.webp?ex=6572158c&is=655fa08c&hm=fe6c977a28627723c03c9f5b015d9255988a185119aa80c65a6fc468670d6494&",
  "https://cdn.discordapp.com/attachments/1173170489800261632/1177321983072014376/F-gCNBobIAAhwT0.webp?ex=6572158a&is=655fa08a&hm=dd7de2f1f2fa7caa2e00a565e102f332b6c7443372dbbe21475345b666d5f8be&",
  "https://cdn.discordapp.com/attachments/1160574192262062112/1188476276328112148/IMG_0744.png?ex=659aa9c9&is=658834c9&hm=fc772afbcc5e7c1eb18fc9a0452132b47f251f806511412fb7d1cf0a0ee59fa4&",
];
module.exports = {
  run: async ({ interaction }) => {
    await interaction.reply(duro[Math.floor(Math.random() * duro.length)]);
  },
  data: {
    name: "imagendura",
    description: "spawnea una imagen mas dura el pan al dia siguiente",
  },
};
