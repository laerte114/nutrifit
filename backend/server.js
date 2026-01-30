const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());
app.use(cors());

const SECRET_KEY = process.env.SECRET_KEY || "sua_chave_secreta_aqui";
const mongoURI = process.env.MONGO_URI || "mongodb+srv://rodrigueslaerte736_db_user:nutrifit2026@cluster0.zr8vca5.mongodb.net/Nutrifit?retryWrites=true&w=majority";

// --- SCHEMAS ---
const User = mongoose.model('User', new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}));

const Meal = mongoose.model('Meal', new mongoose.Schema({
  email: String, 
  nome: String,
  gramas: Number,
  c: Number,
  p: Number,
  cho: Number,
  g: Number,
  data: String
}));

const FoodBase = mongoose.model('FoodBase', new mongoose.Schema({
  userEmail: String, // Usando userEmail para manter consistência com suas rotas
  nome: String,
  c: Number,
  p: Number,
  cho: Number,
  g: Number
}));

// --- LISTA DOS 56 ALIMENTOS (Base Inicial) ---
const baseFixa = [
  // CEREAIS E MASSAS
  { nome: "arroz branco", c: 130, p: 2.6, cho: 28.2, g: 0.2, userEmail: "sistema@nutrifit.com" },
  { nome: "arroz integral", c: 124, p: 2.6, cho: 25.8, g: 1, userEmail: "sistema@nutrifit.com" },
  { nome: "feijão", c: 76, p: 4.8, cho: 13.6, g: 0.5, userEmail: "sistema@nutrifit.com" },
  { nome: "macarrão", c: 158, p: 5.8, cho: 30.7, g: 0.9, userEmail: "sistema@nutrifit.com" },
  { nome: "aveia", c: 394, p: 13.9, cho: 66.6, g: 8.5, userEmail: "sistema@nutrifit.com" },
  { nome: "pão de forma", c: 265, p: 8.8, cho: 49.5, g: 3.7, userEmail: "sistema@nutrifit.com" },
  { nome: "pão francês", c: 300, p: 8, cho: 58, g: 3, userEmail: "sistema@nutrifit.com" },
  { nome: "tapioca", c: 240, p: 0, cho: 60, g: 0, userEmail: "sistema@nutrifit.com" },
  { nome: "cuscuz", c: 113, p: 2.2, cho: 25.4, g: 0.2, userEmail: "sistema@nutrifit.com" },
  { nome: "batata doce", c: 86, p: 1.6, cho: 20.1, g: 0.1, userEmail: "sistema@nutrifit.com" },
  { nome: "batata inglesa", c: 86, p: 2, cho: 20, g: 0.1, userEmail: "sistema@nutrifit.com" },

  // PROTEÍNAS ANIMAIS
  { nome: "frango grelhado (peito)", c: 165, p: 31, cho: 0, g: 3.6, userEmail: "sistema@nutrifit.com" },
  { nome: "ovo cozido", c: 155, p: 13, cho: 1.1, g: 10.6, userEmail: "sistema@nutrifit.com" },
  { nome: "ovo frito", c: 196, p: 13.6, cho: 1.2, g: 15, userEmail: "sistema@nutrifit.com" },
  { nome: "carne moída", c: 219, p: 35.9, cho: 0, g: 7.3, userEmail: "sistema@nutrifit.com" },
  { nome: "tilápia", c: 128, p: 26, cho: 0, g: 2.7, userEmail: "sistema@nutrifit.com" },
  { nome: "atum", c: 116, p: 26, cho: 0, g: 1, userEmail: "sistema@nutrifit.com" },
  { nome: "sardinha", c: 208, p: 24.6, cho: 0, g: 11.5, userEmail: "sistema@nutrifit.com" },
  { nome: "presunto", c: 145, p: 16.5, cho: 2, g: 8, userEmail: "sistema@nutrifit.com" },

  // LATICÍNIOS
  { nome: "leite integral", c: 61, p: 3.2, cho: 4.8, g: 3.3, userEmail: "sistema@nutrifit.com" },
  { nome: "leite desnatado", c: 35, p: 3.3, cho: 5, g: 0.1, userEmail: "sistema@nutrifit.com" },
  { nome: "iogurte natural", c: 51, p: 4.1, cho: 5, g: 1.5, userEmail: "sistema@nutrifit.com" },
  { nome: "mussarela", c: 330, p: 22.6, cho: 3, g: 25, userEmail: "sistema@nutrifit.com" },
  { nome: "requeijao", c: 257, p: 9.6, cho: 3.5, g: 23, userEmail: "sistema@nutrifit.com" },

  // FRUTAS
  { nome: "banana", c: 89, p: 1.1, cho: 23, g: 0.3, userEmail: "sistema@nutrifit.com" },
  { nome: "maçã", c: 52, p: 0.3, cho: 14, g: 0.2, userEmail: "sistema@nutrifit.com" },
  { nome: "abacate", c: 160, p: 2, cho: 9, g: 15, userEmail: "sistema@nutrifit.com" },
  { nome: "mamão", c: 43, p: 0.5, cho: 11, g: 0.1, userEmail: "sistema@nutrifit.com" },
  { nome: "laranja", c: 47, p: 0.9, cho: 12, g: 0.1, userEmail: "sistema@nutrifit.com" },
  { nome: "uva", c: 69, p: 0.7, cho: 18, g: 0.2, userEmail: "sistema@nutrifit.com" },
  { nome: "melancia", c: 30, p: 0.6, cho: 7.5, g: 0.2, userEmail: "sistema@nutrifit.com" },
  { nome: "abacaxi", c: 50, p: 0.5, cho: 13, g: 0.1, userEmail: "sistema@nutrifit.com" },
  { nome: "morango", c: 33, p: 0.7, cho: 8, g: 0.3, userEmail: "sistema@nutrifit.com" },

  // VEGETAIS E LEGUMES
  { nome: "brócolis", c: 35, p: 2.4, cho: 7, g: 0.4, userEmail: "sistema@nutrifit.com" },
  { nome: "cenoura", c: 41, p: 0.9, cho: 10, g: 0.2, userEmail: "sistema@nutrifit.com" },
  { nome: "alface", c: 14, p: 1, cho: 3, g: 0.2, userEmail: "sistema@nutrifit.com" },
  { nome: "tomate", c: 18, p: 0.9, cho: 3.9, g: 0.2, userEmail: "sistema@nutrifit.com" },
  { nome: "pepino", c: 15, p: 0.7, cho: 3.6, g: 0.1, userEmail: "sistema@nutrifit.com" },
  { nome: "abóbora", c: 26, p: 1, cho: 6.5, g: 0.1, userEmail: "sistema@nutrifit.com" },
  { nome: "chuchu", c: 19, p: 0.6, cho: 4.1, g: 0.1, userEmail: "sistema@nutrifit.com" },

  // GORDURAS E SUPLEMENTOS
  { nome: "azeite", c: 884, p: 0, cho: 0, g: 100, userEmail: "sistema@nutrifit.com" },
  { nome: "manteiga", c: 717, p: 0.9, cho: 0.1, g: 81, userEmail: "sistema@nutrifit.com" },
  { nome: "pasta de amendoim", c: 588, p: 25, cho: 20, g: 50, userEmail: "sistema@nutrifit.com" },
  { nome: "whey protein", c: 400, p: 80, cho: 8, g: 6, userEmail: "sistema@nutrifit.com" },
  { nome: "creatina", c: 0, p: 0, cho: 0, g: 0, userEmail: "sistema@nutrifit.com" },
  { nome: "castanha", c: 656, p: 14, cho: 12, g: 66, userEmail: "sistema@nutrifit.com" },

  ];

// FUNÇÃO DE INJEÇÃO AUTOMÁTICA
const seedDatabase = async () => {
  try {
    // IMPORTANTE: Use o modelo FoodBase que definimos no server.js
    const count = await FoodBase.countDocuments({ userEmail: "sistema@nutrifit.com" });
    
    console.log(`--- Verificando Banco: ${count} alimentos encontrados ---`);

    if (count === 0) {
      console.log("🚚 Base vazia! Tentando injetar 56 alimentos...");
      
      // Garante que os dados da baseFixa tenham o campo userEmail correto
      const basePronta = baseFixa.map(item => ({
        ...item,
        userEmail: "sistema@nutrifit.com"
      }));

      await FoodBase.insertMany(basePronta);
      console.log("✅ SUCESSO: Alimentos injetados no MongoDB!");
    } else {
      console.log("ℹ️ Injeção pulada: Alimentos já existem.");
    }
  } catch (err) {
    console.error("❌ ERRO CRÍTICO NA INJEÇÃO:", err);
  }
};

// --- CONEXÃO ÚNICA ---
mongoose.connect(mongoURI)
  .then(() => {
    console.log("✅ CONECTADO AO MONGODB ATLAS");
    seedDatabase();
  })
  .catch(err => console.error("❌ Erro MongoDB:", err.message));

// --- ROTAS ---

app.get('/', (req, res) => {
  res.send('🚀 Backend NutriFit - Online e Sincronizado');
});

app.post('/register', async (req, res) => {
  try {
    const { nome, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "E-mail já cadastrado." });
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ nome, email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: "Sucesso" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Incorreto" });
    }
    const token = jwt.sign({ email: user.email }, SECRET_KEY, { expiresIn: '1d' });
    res.json({ token, nome: user.nome, email: user.email });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// BUSCAR ALIMENTOS DA BASE (Corrigido para aceitar email na rota)
app.get('/meus-alimentos/:email', async (req, res) => {
  try {
    const alimentos = await FoodBase.find({ userEmail: req.params.email });
    res.json(alimentos);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/refeicoes/:email/:data', async (req, res) => {
  try {
    const { email, data } = req.params;
    const meals = await Meal.find({ email, data }).sort({ _id: -1 });
    res.json(meals);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/refeicoes', async (req, res) => {
  try {
    const { email, alimento, data } = req.body;
    const newMeal = new Meal({ 
      email: email, 
      nome: alimento.nome,
      gramas: alimento.gramas,
      c: alimento.cal || alimento.c, // Aceita os dois nomes por segurança
      p: alimento.p || 0, 
      cho: alimento.cho || 0,
      g: alimento.g || 0,
      data: data 
    });
    await newMeal.save();
    res.status(201).json(newMeal);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/meus-alimentos', async (req, res) => {
  try {
    const { email, nome, c, p, cho, g } = req.body;
    const novoAlimento = new FoodBase({
      userEmail: email,
      nome: nome ? nome.toLowerCase() : "sem nome",
      c: Number(c) || 0, 
      p: Number(p) || 0, 
      cho: Number(cho) || 0, 
      g: Number(g) || 0
    });
    await novoAlimento.save();
    res.status(201).json(novoAlimento);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/refeicoes/:id', async (req, res) => {
  try {
    await Meal.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Deletado!" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ... (outras rotas)

// COLOQUE EXATAMENTE AQUI:
app.get('/force-seed', async (req, res) => {
  try {
    console.log("Iniciando force-seed...");
    // 1. Limpa o que houver do sistema
    await FoodBase.deleteMany({ userEmail: "sistema@nutrifit.com" });
    
    // 2. Injeta a lista atualizada
    await FoodBase.insertMany(baseFixa);
    
    console.log("✅ Base fixa injetada via rota!");
    res.send("<h1>🚀 BASE REINICIADA!</h1><p>56 alimentos foram injetados no MongoDB.</p>");
  } catch (err) {
    console.error("Erro no force-seed:", err);
    res.status(500).send("Erro: " + err.message);
  }
});

// ... app.listen

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server rodando na porta ${PORT}`);
});