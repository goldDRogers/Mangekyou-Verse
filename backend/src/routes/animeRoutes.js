const express = require('express');
const router = express.Router();
const { searchAnime, getAnimeDetails, getAnimeEpisodes, getEpisodeSources, getSpotlight, getTrending } = require('../controllers/animeController');

// Public routes (no auth needed typically, but can be added if premium)
router.get('/search', searchAnime);
router.get('/spotlight', getSpotlight);
router.get('/trending', getTrending);
router.get('/:id', getAnimeDetails);
router.get('/:id/episodes', getAnimeEpisodes);
router.get('/episodes/:id', getEpisodeSources);

module.exports = router;
