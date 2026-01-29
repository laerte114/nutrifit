const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');


const app = express();
app.use(express.json());
app.use(cors());

// --- CONFIGURAÇÃO DE SEGURANÇA (IMPORTANTE PARA VENDA) ---
const SECRET_KEY = "sua_chave_secreta_aqui";

// --- CONFIGURAÇÃO DO BANCO DE DADOS (ATUALIZADO) ---
// Este link ignora o erro 'querySrv' por não usar o prefixo +srv
const mongoURI = "mongodb://rodrigueslaerte736_db_user:EUanYjKN2Q9HPdYu@cluster0-shard-00-00.zr8vca5.mongodb.net:27017,cluster0-shard-00-01.zr8vca5.mongodb.net:27017,cluster0-shard-00-02.zr8vca5.mongodb.net:27017/nutrifit?ssl=true&replicaSet=atlas-zr8vca5-shard-0&authSource=admin&retryWrites=true&w=majority";

mongoose.connect(mongoURI)
  .then(() => console.log("✅ CONECTADO AO MONGODB ATLAS (NUVEM)"))
  .catch(err => console.error("❌ Erro MongoDB Cloud:", err.message));

// --- SCHEMAS ---

const UserSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});
const User = mongoose.model('User', UserSchema);

const MealSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  nome: String,
  gramas: Number,
  cal: Number,
  p: { type: Number, default: null },   
  cho: { type: Number, default: null }, 
  g: { type: Number, default: null },   
  data: String 
});
const Meal = mongoose.model('Meal', MealSchema);

const foodSchema = new mongoose.Schema({
  userEmail: { type: String }, // Adicionado para filtrar alimentos por usuário
  nome: String,
  c: Number,
  p: Number,
  cho: Number,
  g: Number
}, { collection: 'foodbases' }); 
const FoodBase = mongoose.model('FoodBase', foodSchema);

// --- ROTAS (AUTENTICAÇÃO, REFEIÇÕES E ALIMENTOS) ---
// Suas rotas continuam exatamente iguais...

app.post('/register', async (req, res) => {
  try {
    const { nome, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "E-mail já cadastrado." });
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ nome, email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: "Sucesso" });
  } catch (err) { res.status(500).send(); }
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
  } catch (err) { res.status(500).send(); }
});

app.get('/refeicoes/:email/:data', async (req, res) => {
  try {
    const { email, data } = req.params;
    const meals = await Meal.find({ userEmail: email, data: data }).sort({ _id: -1 });
    res.json(meals);
  } catch (err) { res.status(500).json(err); }
});

app.post('/refeicoes', async (req, res) => {
  try {
    const { email, alimento, data } = req.body;
    const newMeal = new Meal({ 
      userEmail: email, 
      nome: alimento.nome,
      gramas: alimento.gramas,
      cal: alimento.cal,
      p: alimento.p ?? null, 
      cho: alimento.cho ?? null,
      g: alimento.g ?? null,
      data: data 
    });
    await newMeal.save();
    res.status(201).json(newMeal);
  } catch (err) { res.status(500).json(err); }
});

app.delete('/refeicoes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || id === 'undefined') return res.status(400).json({ error: "ID inválido" });
    const result = await Meal.findByIdAndDelete(id);
    if (!result) return res.status(404).json({ error: "Não encontrado" });
    return res.status(200).json({ message: "Deletado!" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/alimentos-base', async (req, res) => {
  try {
    const alimentos = await FoodBase.find({}); 
    res.json(alimentos);
  } catch (err) { res.status(500).json({ error: "Erro interno" }); }
});

app.get('/meus-alimentos/:email', async (req, res) => {
  try {
    const meusAlimentos = await FoodBase.find({ userEmail: req.params.email });
    res.json(meusAlimentos);
  } catch (err) { res.status(500).json(err); }
});

app.post('/meus-alimentos', async (req, res) => {
  try {
    const { email, nome, c, p, cho, g } = req.body;
    const novoAlimento = new FoodBase({
      userEmail: email,
      nome: nome.toLowerCase(),
      c, p, cho, g
    });
    await novoAlimento.save();
    res.status(201).json(novoAlimento);
  } catch (err) { res.status(500).json(err); }
});

const PORT = 3001;
app.listen(PORT, () => console.log(`🚀 Server rodando na porta ${PORT}`));