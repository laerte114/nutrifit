const express = require("express");
const UserController = require("../controllers/user.controller");

const router = express.Router();

// Atualizar perfil do usuário
router.put("/:id/profile", UserController.updateProfile);

module.exports = router;
