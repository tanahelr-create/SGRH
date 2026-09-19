// Détecte le type réel d'un fichier par ses premiers octets (magic bytes), pour ne
// pas se fier au seul nom/extension envoyé par le client (facilement usurpable :
// un exécutable renommé "x.pdf" passerait une simple vérification d'extension).
function detectFileType(buffer) {
  if (buffer.length >= 5 && buffer.subarray(0, 5).toString('ascii') === '%PDF-') return 'pdf';
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'jpg';
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png';
  return null;
}

const EXT_BY_TYPE = { pdf: ['.pdf'], jpg: ['.jpg', '.jpeg'], png: ['.png'] };

// Vérifie que le contenu réel correspond à l'un des types autorisés ET que
// l'extension déclarée est cohérente avec ce contenu réel.
function isAllowedFile(buffer, originalname, allowedTypes) {
  const detected = detectFileType(buffer);
  if (!detected || !allowedTypes.includes(detected)) return false;
  const ext = originalname.slice(originalname.lastIndexOf('.')).toLowerCase();
  return EXT_BY_TYPE[detected].includes(ext);
}

module.exports = { detectFileType, isAllowedFile };
