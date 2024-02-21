const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');
const { is_auth } = require('../middlewares/is_auth');

router.get('/home', is_auth, homeController.getHomepage);

module.exports = router;