const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const { logged } = require('../middlewares/logged');
const req_limiter = require("../middlewares/req_limiter");

router.get('/getUsers', userController.getUser);

router.get('/register', logged, authController.registerForm);
router.post('/register', authController.register);

router.get('/login', logged, authController.loginForm);
router.post('/login', req_limiter, authController.login);

router.get('/logout', authController.logout);

router.get('/', function(req, res){
	res.redirect('/login')
});
module.exports = router;