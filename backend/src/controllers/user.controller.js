const User = require("../models/user.model");

exports.updateProfile = (req, res) => {
  const { id } = req.params;
  const { name, weight, height, activity_level } = req.body;

  User.updateProfile(id, { name, weight, height, activity_level }, (err) => {
    if (err) return res.status(500).json({ message: "Erro ao atualizar o perfil" });
    res.json({ message: "Perfil atualizado com sucesso" });
  });
};
