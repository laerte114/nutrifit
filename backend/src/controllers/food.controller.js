const db = require("../database/db");

const FoodController = {
  getTodayFoods: (req, res) => {
    const { userId } = req.params;
    const today = new Date().toISOString().split("T")[0];
    const query = `SELECT * FROM foods WHERE user_id = ? AND date = ?`;
    db.all(query, [userId, today], (err, rows) => {
      if (err) return res.status(500).json({ message: "Erro ao buscar alimentos", err });
      res.json(rows);
    });
  },

  addFood: (req, res) => {
    const { userId, name, calories, protein, carbs, fat } = req.body;
    const date = new Date().toISOString().split("T")[0];
    const query = `INSERT INTO foods (user_id, name, calories, protein, carbs, fat, date) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    db.run(query, [userId, name, calories, protein, carbs, fat, date], function (err) {
      if (err) return res.status(500).json({ message: "Erro ao adicionar alimento", err });
      res.json({ message: "Alimento adicionado ✅", foodId: this.lastID });
    });
  },
};

module.exports = FoodController;
