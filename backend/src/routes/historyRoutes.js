const express = require('express');
const router = express.Router();
const { getHistory, updateHistory } = require('../controllers/historyController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getHistory);
router.post('/', protect, updateHistory);

module.exports = router;
