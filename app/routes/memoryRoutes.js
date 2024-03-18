const express = require('express');
const router = express.Router();
const { is_auth } = require('../middlewares/is_auth');
const addController = require('../controllers/addController');
const memoryController = require('../controllers/memoryController');
const upload = require('../../config/multer.config');

router.get('/memory/add', is_auth, addController.addForm);

router.post('/memory/add', is_auth, upload.single('file'), addController.addMemory);

router.get('/memory/per_mention', is_auth, memoryController.getMemoryPerMention);

router.get('/memory/per_diploma', is_auth, memoryController.getMemoryPerDiploma);

router.get('/memory/per_theme', is_auth, memoryController.getMemoryPerThemeForm);

router.get('/memory/all', is_auth, memoryController.getAllMemory);

router.get('/memory', is_auth, memoryController.getMemoryDetail);

router.get('/memory/:id', is_auth, memoryController.updateMemoryForm);

router.post('/memory/:id', is_auth, memoryController.updateMemory);

module.exports = router;