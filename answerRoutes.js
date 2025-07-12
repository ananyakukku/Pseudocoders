const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const answerController = require('../controllers/answerController');

router.post('/:questionId', auth, answerController.createAnswer);
router.put('/:id', auth, answerController.updateAnswer);
router.delete('/:id', auth, answerController.deleteAnswer);
router.post('/:id/vote', auth, answerController.voteAnswer);
router.post('/:id/accept', auth, answerController.acceptAnswer);

module.exports = router;