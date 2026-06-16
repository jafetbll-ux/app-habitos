const mongoose = require('mongoose');

const habitoSchema = new mongoose.Schema({
  nombre:       { type: String, required: true },
  categoria:    { type: String, enum: ['Salud', 'Estudio', 'Deporte'], required: true },
  estado:       { type: String, enum: ['No iniciado', 'En progreso', 'Logrado', 'No completado'], default: 'No iniciado' },
  descripcion:  { type: String, default: '' },
  recordatorio: { type: String, default: '' },
  racha:        { type: Number, default: 0 },
  ultimaFecha:  { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Habito', habitoSchema);