const express = require('express');
const router = express.Router();
const Habito = require('../models/Habito');

// Obtener todos
router.get('/', async (req, res) => {
  try {
    const habitos = await Habito.find();
    res.json(habitos);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener hábitos' });
  }
});

// Crear uno nuevo
router.post('/', async (req, res) => {
  try {
    const { nombre, categoria, estado, descripcion, recordatorio } = req.body;
    if (!nombre || nombre.trim() === '')
      return res.status(400).json({ error: 'El nombre es obligatorio' });
    if (!categoria)
      return res.status(400).json({ error: 'La categoría es obligatoria' });
    const habito = new Habito({ nombre, categoria, estado, descripcion, recordatorio });
    await habito.save();
    res.status(201).json(habito);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Actualizar — con lógica de racha
router.put('/:id', async (req, res) => {
  try {
    const habito = await Habito.findById(req.params.id);
    if (!habito) return res.status(404).json({ error: 'Hábito no encontrado' });

    const { estado } = req.body;
    const hoy = new Date().toISOString().split('T')[0]; // "2026-06-15"

    // Lógica de racha
    if (estado === 'Logrado') {
      if (habito.ultimaFecha === '') {
        // Primera vez que se completa
        habito.racha = 1;
        habito.ultimaFecha = hoy;
      } else if (habito.ultimaFecha === hoy) {
        // Ya se completó hoy, no cambia la racha
      } else {
        const ayer = new Date();
        ayer.setDate(ayer.getDate() - 1);
        const ayerStr = ayer.toISOString().split('T')[0];

        if (habito.ultimaFecha === ayerStr) {
          // Día consecutivo, incrementa racha
          habito.racha = (habito.racha || 0) + 1;
        } else {
          // Se rompió la racha, reinicia
          habito.racha = 1;
        }
        habito.ultimaFecha = hoy;
      }
    } else if (estado === 'No completado') {
      // Se rompió la racha
      habito.racha = 0;
    }

    // Actualizar el resto de campos
    const campos = ['nombre', 'categoria', 'descripcion', 'recordatorio', 'estado'];
    campos.forEach(c => { if (req.body[c] !== undefined) habito[c] = req.body[c]; });

    await habito.save();
    res.json(habito);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Eliminar
router.delete('/:id', async (req, res) => {
  try {
    await Habito.findByIdAndDelete(req.params.id);
    res.json({ mensaje: 'Hábito eliminado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar' });
  }
});

module.exports = router;