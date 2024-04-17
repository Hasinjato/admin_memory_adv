const express = require('express');
const router = express.Router();
const { is_auth } = require('../middlewares/is_auth');
const {
    addForm,
    addMemory,
    abord_add_memory
} = require('../controllers/addController');

const {
    getMemoryPerMention,
    getMemoryPerDiploma,
    getMemoryPerThemeForm,
    getAllMemory,
    getMemoryDetail,
    updateMemoryForm,
    updateMemory,
    deleteMemory,
    getFormCompare,
    compareMemory,
    compareMemoryToAll,
    before_add_compare
} = require('../controllers/memoryController');

const upload = require('../../config/multer.config');

router.get('/memory/add', is_auth, addForm);

router.post('/memory/add', is_auth, upload.single('file'), addMemory);

router.get('/memory/abord_add', is_auth, abord_add_memory);

router.get('/memory/per_mention', is_auth, getMemoryPerMention);

router.get('/memory/per_diploma', is_auth, getMemoryPerDiploma);

router.get('/memory/per_theme', is_auth, getMemoryPerThemeForm);

router.get('/memory/all', is_auth, getAllMemory);

router.get('/memory', is_auth, getMemoryDetail);

router.get('/memory/update/:id', is_auth, updateMemoryForm);

router.post('/memory/update/:id', is_auth, updateMemory);

router.delete('/memory', is_auth, deleteMemory);

router.get('/memory/compare', is_auth, getFormCompare);

router.post('/memory/compare', is_auth, compareMemory);

router.post('/memory/compare_or_add', is_auth, upload.single('file'), before_add_compare);

router.post('/memory/compare_to_all', is_auth, compareMemoryToAll);

module.exports = router;