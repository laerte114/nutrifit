const db = require("../database/db");
const bcrypt = require("bcrypt");

module.exports = {
  register: (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "Todos os campos são obrigatórios" });

    const hashedPassword = bcrypt.hashSync(password, 10);
    const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
    db.run(sql, [name, email, hashedPassword], function (err) {
      if (err) return res.status(500).json({ message: "Erro ao registrar usuário", err });
      res.json({ message: "Registro realizado com sucesso", user: { id: this.lastID, name, email, is_premium: 0 } });
    });
  },

  login: (req, res) => {
    const { email, password } = req.body;
    const sql = "SELECT * FROM users WHERE email = ?";
    db.get(sql, [email], (err, user) => {
      if (err) return res.status(500).json({ message: "Erro no login", err });
      if (!user) return res.status(404).json({ message: "Usuário não encontrado" });

      const isValid = bcrypt.compareSync(password, user.password);
      if (!isValid) return res.status(401).json({ message: "Senha incorreta" });

      res.json({
        message: "Login realizado com sucesso",
        user: { id: user.id, name: user.name, email: user.email, is_premium: user.is_premium }
      });
    });
  }
};
