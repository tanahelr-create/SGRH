const path = require('path');

const UPLOADS_ROOT = path.join(__dirname, '../../uploads');

// Sert un fichier stocké sous uploads/<sous-dossier>/... dont le chemin est en base
// (ex. "/uploads/situations-administratives/xxx.pdf"), jamais public via express.static.
// L'appelant doit avoir déjà vérifié le droit d'accès (propriétaire/RH) avant d'appeler ceci.
function sendUploadedFile(res, storedPath, downloadName) {
  const cleaned = String(storedPath || '').replace(/^\/?uploads\//, '');
  const absolute = path.join(UPLOADS_ROOT, cleaned);
  if (!absolute.startsWith(UPLOADS_ROOT + path.sep)) {
    return res.status(400).json({ message: 'Chemin de fichier invalide' });
  }
  return res.download(absolute, downloadName || path.basename(absolute));
}

module.exports = { sendUploadedFile };
