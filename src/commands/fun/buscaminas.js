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
        var i = 0;
        var j = 0;
        while (j < n){
            board[i][j] = ((board[i][j] == 'X') ? buscaminasLogos[10] : buscaminasLogos[board[i][j]]); 
            ++i;
            if(i >= m){
                j++; 
                i = 0;
            } 
        }
    
        return board;
    }
    const columnas = interaction.options.get("columnas")?.value;
    const filas = interaction.options.get("filas")?.value;
    await interaction.deferReply();
    let tabla = generarTabla(filas, columnas);
    for (let i = 0; i < filas; i++) {
        await interaction.editReply(tabla[i].join('\n'));
    }
    
  },
  data: {
    name: "buscaminas",
    description: 'para nada copiado de un tio que hizo lo mismo',
    options: [
        {
          name: "filas",
          description: "pon 5 como recomendacion",
          type: ApplicationCommandOptionType.Integer,
          
          
          required: true,
        },
        {
            name: "columnas",
            description: "pon 5 como recomendacion",
            type: ApplicationCommandOptionType.Integer,
            
            required: true,
            
        }
    ],
  },
};
