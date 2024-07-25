const express = require('express');
const { searchParts } = require('../controllers/partController');

const router = express.Router();

router.post('/search', searchParts);

module.exports = router;