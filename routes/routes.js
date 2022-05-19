const express = require("express");
const router = require('express-promise-router')();
const usercontrollers = require('../controllers/userControllers');
const qandrcontrollers = require('../controllers/qandrController');
const middlewares = require('../controllers/middlewares');
const cupoes = require('../controllers/cupoesController')
const productcontrollers = require('../controllers/productControllers');


router.route('/user').post(usercontrollers.register).put(usercontrollers.login);
router.route('/questions/:prod_id').post(qandrcontrollers.create_question);
router.route('/questions/:prod_id/:question_id').post(qandrcontrollers.create_response);
router.route('/rating/:prod_id').post(qandrcontrollers.add_rating);
router.route('/campaign').post(cupoes.createCampanha)
router.route('/cart').post(productcontrollers.cart);
router.route('/subscribe/:campanha_id').put(cupoes.subscribe)
router.route('/product/:produto_id').post(productcontrollers.criar_novo_produto).put(productcontrollers.update_product);

module.exports = router;


