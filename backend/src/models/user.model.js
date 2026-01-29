const db = require("../database/db");
const bcrypt = require("bcrypt");

class User {
  static create({ name, email, password }, callback) {
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) return callback(err);
      const sql = `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`;
      db.run(sql, [name, email, hash], function(err) {
        callback(err, this.lastID);
      });
    });
  }

  static findByEmail(email, callback) {
    db.get(`SELECT * FROM users WHERE email = ?`, [email], callback);
  }

  static findById(id, callback) {
    db.get(`SELECT * FROM users WHERE id = ?`, [id], callback);
  }

  static updateProfile(id, { name, weight, height, activity_level }, callback) {
    const sql = `
      UPDATE users 
      SET name = ?, weight = ?, height = ?, activity_level = ?
      WHERE id = ?
    `;
    db.run(sql, [name, weight, height, activity_level, id], callback);
  }
}

module.exports = User;
