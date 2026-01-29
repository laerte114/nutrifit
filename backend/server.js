const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());
app.use(cors());

const SECRET_KEY = process.env.SECRET_KEY || "sua_chave_secreta_aqui";
const mongoURI = process.env.MONGO_URI || "mongodb+srv://rodrigueslaerte736_db_user:nutrifit2026@cluster0.zr8vca5.mongodb.net/nutrifit?retryWrites=true&w=majority";

mongoose.connect(mongoURI)
  .then(() => console.log("✅ CONECTADO AO MONGODB ATLAS"))
  .catch(err => console.error("❌ Erro MongoDB:", err.message));

// --- SCHEMAS ---
const UserSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});
const User = mongoose.model('User', UserSchema);

// Schema Unificado para Refeições e Alimentos
const MealSchema = new mongoose.Schema({
  email: String, 
  nome: String,
  gramas: Number,
  cal: Number,
  p: Number,
  cho: Number,
  g: Number,
  data: String
});
const Meal = mongoose.model('Meal', MealSchema);

// Criando o modelo FoodBase que estava faltando!
const FoodBase = mongoose.model('FoodBase', new mongoose.Schema({
  userEmail: String,
  nome: String,
  c: Number,
  p: Number,
  cho: Number,
  g: Number
}));

// --- ROTAS ---

app.get('/', (req, res) => {
  res.send('🚀 Backend NutriFit Online - Versão Gratuita');
});

// LOGIN E REGISTRO (Mantidos como estavam)
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

// BUSCAR REFEIÇÕES (Corrigido para usar 'email' em vez de 'userEmail')
app.get('/refeicoes/:email/:data', async (req, res) => {
  try {
    const { email, data } = req.params;
    const meals = await Meal.find({ email: email, data: data }).sort({ _id: -1 });
    res.json(meals);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// SALVAR REFEIÇÃO (Achatado para evitar erros de objeto aninhado)
app.post('/refeicoes', async (req, res) => {
  try {
    const { email, alimento, data } = req.body;
    const newMeal = new Meal({ 
      email: email, 
      nome: alimento.nome,
      gramas: alimento.gramas,
      cal: alimento.cal,
      p: alimento.p || 0, 
      cho: alimento.cho || 0,
      g: alimento.g || 0,
      data: data 
    });
    await newMeal.save();
    res.status(201).json(newMeal);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// SALVAR NOVO ALIMENTO NA BASE
app.post('/meus-alimentos', async (req, res) => {
  try {
    const { email, nome, c, p, cho, g } = req.body;
    const novoAlimento = new FoodBase({
      userEmail: email,
      nome: nome ? nome.toLowerCase() : "sem nome",
      c: c || 0, 
      p: p || 0, 
      cho: cho || 0, 
      g: g || 0
    });
    await novoAlimento.save();
    res.status(201).json(novoAlimento);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/refeicoes/:id', async (req, res) => {
  try {
    const result = await Meal.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Deletado!" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server rodando na porta ${PORT}`);
});