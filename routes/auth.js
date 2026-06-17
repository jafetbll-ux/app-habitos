const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

const SECRETO = 'clave-secreta-habitos-2026';

// Registro
router.post('/registro', async (req, res) => {
  try {
    const { nombre, email, password } = req.body;
    if (!nombre || !email || !password) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }
    const existe = await Usuario.findOne({ email });
    if (existe) {
      return res.status(400).json({ error: 'Ese correo ya está registrado' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const usuario = new Usuario({ nombre, email, password: passwordHash });
    await usuario.save();

    const token = jwt.sign({ id: usuario._id }, SECRETO, { expiresIn: '30d' });
    res.status(201).json({ token, nombre: usuario.nombre, email: usuario.email });
  } catch (err) {
    res.status(500).json({ error: 'Error al registrar' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(400).json({ error: 'Correo o contraseña incorrectos' });
    }
    const coincide = await bcrypt.compare(password, usuario.password);
    if (!coincide) {
      return res.status(400).json({ error: 'Correo o contraseña incorrectos' });
    }
    const token = jwt.sign({ id: usuario._id }, SECRETO, { expiresIn: '30d' });
    res.json({ token, nombre: usuario.nombre, email: usuario.email });
  } catch (err) {
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

module.exports = router;