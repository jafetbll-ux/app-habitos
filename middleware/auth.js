const jwt = require('jsonwebtoken');
const SECRETO = 'clave-secreta-habitos-2026';

function verificarToken(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'No autorizado' });
  const token = header.split(' ')[1];
  try {
    const datos = jwt.verify(token, SECRETO);
    req.usuarioId = datos.id;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token inválido' });
  }
}

module.exports = verificarToken;