const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const userController = require('../controllers/userController');

router.get('/:id', userController.getUserProfile);
router.put('/profile', auth, userController.updateUserProfile);

module.exports = router;