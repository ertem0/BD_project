const router = require('express-promise-router')();
const usercontrollers = require('../controllers/userControllers');


router.route('/');

router.route('/login').post(usercontrollers.login);
router.route('/register').post(usercontrollers.register);



module.exports = router;


