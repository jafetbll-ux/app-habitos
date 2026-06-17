const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: '*' }));
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/app-habitos')
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch(err => console.log('❌ Error:', err));

const habitosRouter = require('./routes/habitos');
app.use('/api/habitos', habitosRouter);

const authRouter = require('./routes/auth');
app.use('/api/auth', authRouter);

app.use(express.static('public'));

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});