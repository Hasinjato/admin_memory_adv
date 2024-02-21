const express = require('express');
const router = express.Router();
const { is_auth } = require('../middlewares/is_auth');
const addController = require('../controllers/addController');
const memoryController = require('../controllers/memoryController');
const upload = require('../../config/multer.config');


router.get('/memory/add', is_auth, addController.addForm);

router.post('/memory/add', is_auth, upload.single('file'), addController.addMemory);

router.get('/memory/per_mention', is_auth, memoryController.getMemoryMention);

module.exports = router;