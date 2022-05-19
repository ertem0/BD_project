const express = require("express");
const router = require('express-promise-router')();
const usercontrollers = require('../controllers/userControllers');
const qandrcontrollers = require('../controllers/qandrController');
const middlewares = require('../controllers/middlewares');
const cupoes = require('../controllers/cupoesController')
const productcontrollers = require('../controllers/productControllers');


router.route('/user').post(usercontrollers.register).put(usercontrollers.login);
router.route('/create_question').post(middlewares.authenticateToken, qandrcontrollers.create_question);
router.route('/campaign').post(cupoes.createCampanha)
router.route('/cart').post(productcontrollers.cart);
router.route('/subscribe').put(cupoes.subscribe)
router.route('/product').put(productcontrollers.update_product).post(productcontrollers.criar_novo_produto);

module.exports = router;


