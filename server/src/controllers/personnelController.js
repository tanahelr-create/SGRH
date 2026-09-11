const ExcelJS = require('exceljs');
const pool = require('../config/db');
const personnelRepository = require('../repositories/personnelRepository');
const personnelService = require('../services/personnelService');

async function me(req, res) {
  const fiche = await personnelRepository.findByUserId(req.user.id);
  return res.status(200).json({ personnel: fiche });
}

async function create(req, res) {
  const { matricule, nom, prenom, email, role, fonction, corps, grade, service, direction, telephone, typeContrat } = req.body;

  if (!matricule || !nom || !prenom || !email || !role) {
    return res.status(400).json({ message: 'Matricule, nom, prénom, email et rôle sont requis' });
  }
  if (!/^[0-9]{6}$/.test(matricule)) {
    return res.status(400).json({ message: 'Le matricule doit contenir exactement 6 chiffres' });
  }

  try {
    const personnel = await personnelService.createPersonnel(
      { matricule, nom, prenom, email, role, fonction, corps, grade, service, direction, telephone, typeContrat },
      req.user.id
    );
    return res.status(201).json({ message: 'Fiche personnel créée', personnel });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
}

async function list(req, res) {
  const list = await personnelService.listPersonnel();
  return res.status(200).json({ personnel: list });
}

async function listWithoutAccount(req, res) {
  const list = await personnelService.listWithoutAccount();
  return res.status(200).json({ personnel: list });
}

async function sendRegistrationLink(req, res) {
  try {
    await personnelService.sendRegistrationLink(req.params.id, req.user.id);
    return res.status(200).json({ message: "Lien d'inscription envoyé" });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
}

async function exportExcel(req, res) {
  try {
    const result = await pool.query(`SELECT * FROM personnel ORDER BY nom NULLS LAST, matricule`);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Personnel');

    sheet.columns = [
      { header: 'Matricule', key: 'matricule', width: 12 },
      { header: 'Nom', key: 'nom', width: 20 },
      { header: 'Prénom', key: 'prenom', width: 20 },
      { header: 'Email', key: 'email', width: 28 },
      { header: 'Rôle', key: 'role', width: 8 },
      { header: 'Fonction', key: 'fonction', width: 22 },
      { header: 'Corps', key: 'corps', width: 12 },
      { header: 'Grade', key: 'grade', width: 18 },
      { header: 'Service', key: 'service', width: 20 },
      { header: 'Direction', key: 'direction', width: 20 },
      { header: 'Téléphone', key: 'telephone', width: 16 },
      { header: 'Type de contrat', key: 'type_contrat', width: 16 },
    ];
    sheet.getRow(1).font = { bold: true };

    result.rows.forEach((row) => sheet.addRow(row));

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="personnel.xlsx"');

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error('Erreur export Excel:', err);
    res.status(500).json({ message: "Erreur lors de l'export" });
  }
}

async function importExcel(req, res) {
  if (!req.file) {
    return res.status(400).json({ message: 'Fichier Excel requis' });
  }

  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);
    const sheet = workbook.worksheets[0];

    const headerRow = sheet.getRow(1).values.slice(1).map((h) => String(h).trim().toLowerCase());
    const expectedColumns = ['matricule', 'nom', 'prénom', 'email', 'rôle', 'fonction', 'corps', 'grade', 'service', 'direction', 'téléphone', 'type de contrat'];

    const rows = [];
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // en-têtes
      const values = row.values.slice(1);
      rows.push({
        matricule: values[0],
        nom: values[1],
        prenom: values[2],
        email: values[3],
        role: values[4],
        fonction: values[5],
        corps: values[6],
        grade: values[7],
        service: values[8],
        direction: values[9],
        telephone: values[10],
        type_contrat: values[11],
      });
    });

    if (rows.length === 0) {
      return res.status(400).json({ message: 'Le fichier ne contient aucune ligne de données' });
    }

    const results = await personnelService.importFromRows(rows, req.user.id);
    return res.status(200).json(results);
  } catch (err) {
    console.error('Erreur import Excel:', err);
    return res.status(400).json({ message: "Impossible de lire ce fichier. Vérifiez qu'il s'agit bien d'un .xlsx valide." });
  }
}

module.exports = { me, create, list, listWithoutAccount, sendRegistrationLink, exportExcel, importExcel };