const { ApplicationCommandOptionType } = require("discord.js");


module.exports = {
  run: async ({ interaction }) => {
    function generarTabla(n,m) {
        const buscaminasLogos = ["||🟦||","||1️⃣||","||2️⃣||","||3️⃣||","||4️⃣||","||5️⃣||","||6️⃣||","||7️⃣||","||8️⃣||","||9️⃣||","||💣||"];
        let board = [];
        for (let i = 0; i < n; i++) {
            let row = [];
            for (let j = 0; j < m; j++) {
                
                row.push(Math.random() < 0.2 ? 'X' : 0);
            }
            board.push(row);
        }
    
        // calcular los números alrededor de cada bomba
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < m; j++) {
                if (board[i][j] === 'X') {
                    // incrementar los números de cada celda
                    for (let k = i - 1; k <= i + 1; k++) {
                        for (let l = j - 1; l <= j + 1; l++) {
                            if (k >= 0 && k < n && l >= 0 && l < m && board[k][l] !== 'X') {
                                board[k][l]++;
                            }
                        }
                    }
                }
            }
        }
    
        // convertir los números en emojis y spoilers
        for(var i = 0; i < n; i++) {
            for (let j = 0 ; j < m; j++){
                board[i][j] = ((board[i][j] == 'X') ? buscaminasLogos[10] : buscaminasLogos[board[i][j]]); 
            }
        }
        return board;
    }
    
    const columnas = interaction.options.get("dimension")?.value;
    const filas = interaction.options.get("dimension")?.value == 15 ? 5 : interaction.options.get("dimension")?.value;
    await interaction.deferReply();
    let tabla = generarTabla(filas, columnas);
    var bombas = (tabla.join("\n").replace(/,/g, "").match(/💣/g) || []).length;
    let desc = `Bombas: ${bombas} | Desactivadas: 0 | Casillas abiertas: 0`;
    await interaction.editReply(tabla.join('\n').replace(/,/g, "") + `\n${desc}`);
    
    
  },
  data: {
    name: "buscaminas",
    description: 'para nada copiado de un tio que hizo lo mismo',
    options: [
        {
          name: "dimension",
          description: "5x5 como recomendacion",
          type: ApplicationCommandOptionType.Integer,
          required: true,
          choices: [
            {
              name: "5x5",
              value: 5,
            },
            {
              name: "7x7",
              value: 7,
            },
            {
              name: "10x10",
              value: 10,
            },
            {
                name: "15x5",
                value: 15,
            }
          ],
        },
    ],
  },
};
