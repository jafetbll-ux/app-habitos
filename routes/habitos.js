const express = require('express');
const router = express.Router();
const Habito = require('../models/Habito');
const verificarToken = require('../middleware/auth');

router.use(verificarToken);

router.get('/', async (req, res) => {
  try {
    const habitos = await Habito.find({ usuario: req.usuarioId });
    res.json(habitos);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener hábitos' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { nombre, categoria, estado, descripcion, recordatorio } = req.body;
    if (!nombre || nombre.trim() === '')
      return res.status(400).json({ error: 'El nombre es obligatorio' });
    if (!categoria)
      return res.status(400).json({ error: 'La categoría es obligatoria' });
    const habito = new Habito({ nombre, categoria, estado, descripcion, recordatorio, usuario: req.usuarioId });
    await habito.save();
    res.status(201).json(habito);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const habito = await Habito.findOne({ _id: req.params.id, usuario: req.usuarioId });
    if (!habito) return res.status(404).json({ error: 'Hábito no encontrado' });

    const { estado } = req.body;
    const hoy = new Date().toISOString().split('T')[0];

    if (estado === 'Logrado') {
      if (habito.ultimaFecha === '') {
        habito.racha = 1;
        habito.ultimaFecha = hoy;
      } else if (habito.ultimaFecha === hoy) {
        // no cambia
      } else {
        const ayer = new Date();
        ayer.setDate(ayer.getDate() - 1);
        const ayerStr = ayer.toISOString().split('T')[0];
        if (habito.ultimaFecha === ayerStr) {
          habito.racha = (habito.racha || 0) + 1;
        } else {
          habito.racha = 1;
        }
        habito.ultimaFecha = hoy;
      }
    } else if (estado === 'No completado') {
      habito.racha = 0;
    }

    const campos = ['nombre', 'categoria', 'descripcion', 'recordatorio', 'estado'];
    campos.forEach(c => { if (req.body[c] !== undefined) habito[c] = req.body[c]; });

    await habito.save();
    res.json(habito);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Habito.findOneAndDelete({ _id: req.params.id, usuario: req.usuarioId });
    res.json({ mensaje: 'Hábito eliminado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar' });
  }
});

module.exports = router;