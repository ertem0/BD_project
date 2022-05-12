const express = require("express");
const router = require('express-promise-router')();
const usercontrollers = require('../controllers/userControllers');
const qandrcontrollers = require('../controllers/qandrController');
const middlewares = require('../controllers/middlewares');

router.route('/user').post(usercontrollers.register).put(usercontrollers.login);
router.route('/create_question').post(middlewares.authenticateToken, qandrcontrollers.create_question);



module.exports = router;


