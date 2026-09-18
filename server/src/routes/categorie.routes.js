const express = require('express');
const categorieController = require('../controllers/categorieController');
const { requireAuth } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', requireAuth, categorieController.list);

module.exports = router;