const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getWatchlist,
    addToWatchlist,
    updateWatchlistItem,
    removeFromWatchlist,
    checkInWatchlist
} = require('../controllers/watchlistController');

router.route('/')
    .get(protect, getWatchlist)
    .post(protect, addToWatchlist);

router.route('/:id')
    .put(protect, updateWatchlistItem)
    .delete(protect, removeFromWatchlist);

router.get('/check/:animeId', protect, checkInWatchlist);

module.exports = router;
