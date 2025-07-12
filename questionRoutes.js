const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const questionController = require('../controllers/questionController');

router.get('/', questionController.getAllQuestions);
router.get('/:id', questionController.getQuestion);
router.post('/', auth, questionController.createQuestion);
router.put('/:id', auth, questionController.updateQuestion);
router.delete('/:id', auth, questionController.deleteQuestion);
router.post('/:id/vote', auth, questionController.voteQuestion);

module.exports = router;