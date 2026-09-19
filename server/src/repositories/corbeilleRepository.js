const pool = require('../config/db');

async function add(typeElement, donnees, supprimePar) {
  const result = await pool.query(
    `INSERT INTO corbeille (type_element, donnees, supprime_par) VALUES ($1, $2, $3) RETURNING *`,
    [typeElement, JSON.stringify(donnees), supprimePar]
  );
  return result.rows[0];
}

async function listAll() {
  const result = await pool.query(
    `SELECT c.*, ud.email AS supprime_par_email
     FROM corbeille c
     LEFT JOIN user_details ud ON ud.id = c.supprime_par
     ORDER BY c.supprime_le DESC`
  );
  return result.rows;
}

async function findById(id) {
  const result = await pool.query(`SELECT * FROM corbeille WHERE id = $1`, [id]);
  return result.rows[0] || null;
}

async function removeFromCorbeille(id) {
  await pool.query(`DELETE FROM corbeille WHERE id = $1`, [id]);
}

// Supprime un compte de façon réversible : capture dans la corbeille le compte ET
// toutes les lignes qui lui appartiennent substantiellement (congés, historique de
// fonction, notifications reçues), puis le supprime — le tout dans une transaction.
// Les autres tables (activity_log, carriere_evenements, documents_generes, diplômes,
// situations administratives...) ne référencent l'utilisateur que comme "auteur" :
// leur colonne passe à NULL automatiquement (migration 002) et leurs lignes, qui
// appartiennent au dossier personnel, restent intactes.
async function archiveAndDeleteCompte(userId, supprimePar) {
  return pool.withTransaction(async (client) => {
    const userResult = await client.query(`SELECT * FROM users WHERE id = $1 FOR UPDATE`, [userId]);
    const user = userResult.rows[0];
    if (!user) return null;

    const congesResult = await client.query(`SELECT * FROM conges WHERE user_id = $1`, [userId]);
    const fonctionHistoryResult = await client.query(`SELECT * FROM fonction_history WHERE user_id = $1`, [userId]);
    const notificationsResult = await client.query(`SELECT * FROM notifications WHERE recipient_id = $1`, [userId]);

    const donnees = {
      user,
      conges: congesResult.rows,
      fonctionHistory: fonctionHistoryResult.rows,
      notifications: notificationsResult.rows,
    };

    const corbeilleResult = await client.query(
      `INSERT INTO corbeille (type_element, donnees, supprime_par) VALUES ($1, $2, $3) RETURNING *`,
      ['compte', JSON.stringify(donnees), supprimePar]
    );

    // Les congés / historique de fonction / notifications viennent d'être
    // sauvegardés ci-dessus : ON DELETE CASCADE (migration 002) peut les
    // supprimer sans perte, ils seront recréés par restoreCompte().
    await client.query(`DELETE FROM users WHERE id = $1`, [userId]);

    return corbeilleResult.rows[0];
  });
}

// Restaure un compte archivé par archiveAndDeleteCompte : recrée la ligne users,
// puis — s'ils n'existent pas déjà — ses congés, son historique de fonction et
// ses notifications, avec leurs identifiants d'origine.
async function restoreCompte(donnees) {
  return pool.withTransaction(async (client) => {
    const u = donnees.user;
    const userResult = await client.query(
      `INSERT INTO users (id, role, email, password_hash, personnel_id, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO NOTHING
       RETURNING *`,
      [u.id, u.role, u.email, u.password_hash, u.personnel_id, u.status, u.created_at]
    );
    const restoredUser = userResult.rows[0];
    if (!restoredUser) return null;

    for (const c of donnees.conges || []) {
      await client.query(
        `INSERT INTO conges (
           id, user_id, type_conge, date_debut, date_fin, motif, status, reviewed_by, reviewed_at,
           created_at, avis_chef_service, lieu_jouissance, date_reprise_service, remplacant,
           validateur_id, decision_intermediaire, decision_intermediaire_le,
           justificatif_filename, justificatif_path
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
         ON CONFLICT (id) DO NOTHING`,
        [
          c.id, c.user_id, c.type_conge, c.date_debut, c.date_fin, c.motif, c.status, c.reviewed_by, c.reviewed_at,
          c.created_at, c.avis_chef_service, c.lieu_jouissance, c.date_reprise_service, c.remplacant,
          c.validateur_id, c.decision_intermediaire, c.decision_intermediaire_le,
          c.justificatif_filename, c.justificatif_path,
        ]
      );
    }

    for (const f of donnees.fonctionHistory || []) {
      await client.query(
        `INSERT INTO fonction_history (id, user_id, ancienne_fonction, nouvelle_fonction, changed_by, changed_at)
         VALUES ($1,$2,$3,$4,$5,$6)
         ON CONFLICT (id) DO NOTHING`,
        [f.id, f.user_id, f.ancienne_fonction, f.nouvelle_fonction, f.changed_by, f.changed_at]
      );
    }

    for (const n of donnees.notifications || []) {
      await client.query(
        `INSERT INTO notifications (id, sender_id, recipient_id, title, message, type, is_read, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         ON CONFLICT (id) DO NOTHING`,
        [n.id, n.sender_id, n.recipient_id, n.title, n.message, n.type, n.is_read, n.created_at]
      );
    }

    return restoredUser;
  });
}

module.exports = { add, listAll, findById, removeFromCorbeille, archiveAndDeleteCompte, restoreCompte };