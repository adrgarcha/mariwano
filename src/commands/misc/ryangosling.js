const { ApplicationCommandOptionType } = require("discord.js");
const ryanGoslingPhotos = [
  "https://media-cldnry.s-nbcnews.com/image/upload/t_fit-1240w,f_auto,q_auto:best/streams/2013/April/130417/1C6968095-120124-drive-movie-still.jpg",
  "https://media.vogue.fr/photos/5fbbdfd569406dbb7ff1ca7c/2:3/w_1920,c_limit/010_A7A11280_145.jpg",
  "https://pbs.twimg.com/media/EsHNG_ZVkAIT1EN?format=jpg",
  "https://media.giphy.com/media/kY2UxEQvIzC2A/giphy.gif",
  "https://pbs.twimg.com/media/EsHNG_bVEAAPBPa?format=jpg",
  "https://64.media.tumblr.com/3c07f342fc99ed57e1d43da118126cb1/88436ca69246c925-44/s400x600/8dc899e16a0fc0a2ce9214fdcc992e8a8c6ac052.gifv",
  "https://media.vanityfair.com/photos/54caa4f4b8f23e3a0314a182/master/w_1920,c_limit/image.jpg",
  "https://i.ytimg.com/vi/SBRJS1_8yPs/maxresdefault.jpg",
  "https://ih1.redbubble.net/image.5090822003.1232/ssrco,classic_tee,mens,101010:01c5ca27c6,front_alt,square_product,600x600.jpg",
  "https://assets.mycast.io/actor_images/actor-ryan-gosling-579626_small.jpg",
];
module.exports = {
  run: async ({ interaction }) => {
    await interaction.reply(
      ryanGoslingPhotos[Math.floor(Math.random() * ryanGoslingPhotos.length)]
    );
  },
  data: {
    name: "ryangoslin",
    description: '"i drive"',
  },
};
