const Answer = require('../models/Answer');
const Question = require('../models/Question');
const User = require('../models/User');

// Create an answer
exports.createAnswer = async (req, res) => {
  try {
    const { body } = req.body;
    const questionId = req.params.questionId;

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const answer = new Answer({
      body,
      question: questionId,
      author: req.userId
    });

    await answer.save();

    // Add answer to question's answers array
    question.answers.push(answer._id);
    await question.save();

    // Add answer to user's answers array
    await User.findByIdAndUpdate(req.userId, {
      $push: { answers: answer._id }
    });

    res.status(201).json(answer);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update an answer
exports.updateAnswer = async (req, res) => {
  try {
    const { body } = req.body;

    const answer = await Answer.findOneAndUpdate(
      { _id: req.params.id, author: req.userId },
      { body },
      { new: true }
    );

    if (!answer) {
      return res.status(404).json({ message: 'Answer not found or unauthorized' });
    }

    res.json(answer);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete an answer
exports.deleteAnswer = async (req, res) => {
  try {
    const answer = await Answer.findOneAndDelete({
      _id: req.params.id,
      author: req.userId
    });

    if (!answer) {
      return res.status(404).json({ message: 'Answer not found or unauthorized' });
    }

    // Remove answer from question's answers array
    await Question.findByIdAndUpdate(answer.question, {
      $pull: { answers: answer._id }
    });

    // Remove answer from user's answers array
    await User.findByIdAndUpdate(req.userId, {
      $pull: { answers: answer._id }
    });

    res.json({ message: 'Answer deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Vote on an answer
exports.voteAnswer = async (req, res) => {
  try {
    const { voteType } = req.body;
    const answerId = req.params.id;
    const userId = req.userId;

    const answer = await Answer.findById(answerId);
    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    // Check if user already voted
    const existingVote = answer.voters.find(v => v.user.toString() === userId);
    
    if (existingVote) {
      // If same vote type, remove vote
      if (existingVote.voteType === voteType) {
        answer.voters = answer.voters.filter(v => v.user.toString() !== userId);
        answer.votes += voteType === 'up' ? -1 : 1;
      } else {
        // If different vote type, update vote
        existingVote.voteType = voteType;
        answer.votes += voteType === 'up' ? 2 : -2;
      }
    } else {
      // Add new vote
      answer.voters.push({ user: userId, voteType });
      answer.votes += voteType === 'up' ? 1 : -1;
    }

    await answer.save();
    res.json(answer);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Accept an answer
exports.acceptAnswer = async (req, res) => {
  try {
    const answerId = req.params.id;
    const userId = req.userId;

    const answer = await Answer.findById(answerId).populate('question');
    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    // Check if the user is the author of the question
    if (answer.question.author.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Unaccept any previously accepted answer for this question
    await Answer.updateMany(
      { question: answer.question._id, _id: { $ne: answerId } },
      { isAccepted: false }
    );

    // Accept this answer
    answer.isAccepted = true;
    await answer.save();

    // Update the question's acceptedAnswer field
    await Question.findByIdAndUpdate(answer.question._id, {
      acceptedAnswer: answerId
    });

    res.json(answer);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};