const mongoose = require('mongoose');

const mongoURI = "mongodb://127.0.0.1:27017/nutrifit";

const FoodBaseSchema = new mongoose.Schema({
  nome: { type: String, required: true, unique: true },
  c: Number, p: Number, cho: Number, g: Number, categoria: String
});

const FoodBase = mongoose.model('FoodBase', FoodBaseSchema);

const alimentos = [
    // PROTEÍNAS
    { nome: "frango", c: 165, p: 31, cho: 0, g: 3.6, categoria: "Proteínas" },
    { nome: "carnebovina", c: 250, p: 26, cho: 0, g: 15, categoria: "Proteínas" },
    { nome: "carnesuina", c: 242, p: 27, cho: 0, g: 14, categoria: "Proteínas" },
    { nome: "carnemoida", c: 212, p: 20, cho: 0, g: 14, categoria: "Proteínas" },
    { nome: "presunto", c: 145, p: 16, cho: 2, g: 8, categoria: "Proteínas" },
    { nome: "salsicha", c: 300, p: 12, cho: 2, g: 26, categoria: "Proteínas" },
    { nome: "ovo", c: 155, p: 13, cho: 1.1, g: 11, categoria: "Proteínas" },
    { nome: "peixe", c: 100, p: 20, cho: 0, g: 2, categoria: "Proteínas" },
    { nome: "tilapia", c: 96, p: 20, cho: 0, g: 1.7, categoria: "Proteínas" },
    { nome: "whey", c: 390, p: 80, cho: 5, g: 4, categoria: "Proteínas" },
    { nome: "creatina", c: 0, p: 0, cho: 0, g: 0, categoria: "Proteínas" },

    // CARBOIDRATOS
    { nome: "arroz", c: 130, p: 2.7, cho: 28, g: 0.3, categoria: "Carboidratos" },
    { nome: "arrozintegral", c: 124, p: 2.6, cho: 25.8, g: 1, categoria: "Carboidratos" },
    { nome: "feijao", c: 76, p: 4.8, cho: 14, g: 0.5, categoria: "Carboidratos" },
    { nome: "cuscuz", c: 112, p: 2.3, cho: 25, g: 0.2, categoria: "Carboidratos" },
    { nome: "tapioca", c: 240, p: 0, cho: 60, g: 0, categoria: "Carboidratos" },
    { nome: "macaxeira", c: 160, p: 1.3, cho: 38, g: 0.3, categoria: "Carboidratos" },
    { nome: "batatadoce", c: 86, p: 1.6, cho: 20, g: 0.1, categoria: "Carboidratos" },
    { nome: "batatainglesa", c: 77, p: 2, cho: 17, g: 0.1, categoria: "Carboidratos" },
    { nome: "macarrao", c: 157, p: 5.8, cho: 30, g: 0.9, categoria: "Carboidratos" },
    { nome: "paofrances", c: 300, p: 9, cho: 58, g: 3, categoria: "Carboidratos" },
    { nome: "paoforma", c: 260, p: 8, cho: 50, g: 3, categoria: "Carboidratos" },
    { nome: "paointegral", c: 230, p: 10, cho: 40, g: 3.5, categoria: "Carboidratos" },
    { nome: "aveia", c: 390, p: 14, cho: 66, g: 7, categoria: "Carboidratos" },
    { nome: "farofa", c: 410, p: 2.1, cho: 80, g: 9.3, categoria: "Carboidratos" },
    { nome: "pipoca", c: 448, p: 12, cho: 78, g: 4.5, categoria: "Carboidratos" },

    // LATICÍNIOS E GORDURAS
    { nome: "leite", c: 60, p: 3.2, cho: 4.8, g: 3.2, categoria: "Laticinios" },
    { nome: "leitedesnatado", c: 35, p: 3.3, cho: 5, g: 0.5, categoria: "Laticinios" },
    { nome: "iogurte", c: 63, p: 3.5, cho: 5, g: 3.3, categoria: "Laticinios" },
    { nome: "mussarela", c: 280, p: 22, cho: 3, g: 20, categoria: "Laticinios" },
    { nome: "queijobranco", c: 250, p: 17, cho: 3, g: 19, categoria: "Laticinios" },
    { nome: "requeijao", c: 257, p: 9, cho: 3, g: 23, categoria: "Laticinios" },
    { nome: "manteiga", c: 717, p: 0.8, cho: 0, g: 81, categoria: "Gorduras" },
    { nome: "azeite", c: 884, p: 0, cho: 0, g: 100, categoria: "Gorduras" },
    { nome: "pastaamendoim", c: 588, p: 25, cho: 20, g: 50, categoria: "Gorduras" },

    // FRUTAS E VEGETAIS
    { nome: "abacaxi", c: 50, p: 0.5, cho: 13, g: 0.1, categoria: "Frutas" },
    { nome: "banana", c: 89, p: 1.1, cho: 23, g: 0.3, categoria: "Frutas" },
    { nome: "maca", c: 52, p: 0.3, cho: 14, g: 0.2, categoria: "Frutas" },
    { nome: "mamao", c: 43, p: 0.5, cho: 11, g: 0.1, categoria: "Frutas" },
    { nome: "manga", c: 60, p: 0.8, cho: 15, g: 0.4, categoria: "Frutas" },
    { nome: "laranja", c: 47, p: 0.9, cho: 12, g: 0.1, categoria: "Frutas" },
    { nome: "uva", c: 69, p: 0.7, cho: 18, g: 0.2, categoria: "Frutas" },
    { nome: "abacate", c: 160, p: 2, cho: 9, g: 15, categoria: "Frutas" },
    { nome: "alface", c: 15, p: 1.3, cho: 2.8, g: 0.2, categoria: "Vegetais" },
    { nome: "tomate", c: 18, p: 0.9, cho: 3.9, g: 0.2, categoria: "Vegetais" },
    { nome: "brocolis", c: 34, p: 2.8, cho: 7, g: 0.4, categoria: "Vegetais" },

    // DOCES E SOBREMESAS
    { nome: "chocolate", c: 540, p: 7, cho: 58, g: 31, categoria: "Doces" },
    { nome: "brigadeiro", c: 320, p: 5, cho: 55, g: 12, categoria: "Doces" },
    { nome: "sorvete", c: 200, p: 3, cho: 25, g: 10, categoria: "Doces" },
    { nome: "pudim", c: 170, p: 4, cho: 28, g: 4.5, categoria: "Doces" },
    { nome: "pacoca", c: 490, p: 12, cho: 50, g: 28, categoria: "Doces" },
    { nome: "goiabada", c: 270, p: 0.5, cho: 70, g: 0, categoria: "Doces" },
    { nome: "docedeleite", c: 315, p: 6, cho: 55, g: 7, categoria: "Doces" },
    { nome: "biscoitorecheado", c: 480, p: 5, cho: 68, g: 21, categoria: "Doces" },
    { nome: "bolosimples", c: 300, p: 5, cho: 50, g: 10, categoria: "Doces" },
    { nome: "gelatina", c: 60, p: 1.5, cho: 14, g: 0, categoria: "Doces" }
];

async function runSeed() {
  try {
    await mongoose.connect(mongoURI);
    console.log("Conectado ao MongoDB...");

    // 1. Limpa a coleção completamente
    await FoodBase.deleteMany({});
    console.log("Esvaziando coleção antiga...");

    // 2. Insere a lista completa
    // O { ordered: false } faz com que, se um item der erro, 
    // ele continue inserindo os outros.
    await FoodBase.insertMany(alimentos, { ordered: false });
    
    // 3. Conta quantos itens foram salvos para conferirmos
    const total = await FoodBase.countDocuments();
    console.log(`✅ SUCESSO! ${total} alimentos foram salvos no MongoDB.`);
    
    process.exit();
  } catch (err) {
    console.error("❌ Erro durante o seed:", err.message);
    process.exit(1);
  }
}

runSeed();