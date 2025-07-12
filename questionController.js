const Question = require('../models/Question');
const Answer = require('../models/Answer');
const User = require('../models/User');

// Get all questions
exports.getAllQuestions = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = '-createdAt', search } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (search) {
      query = { $text: { $search: search } };
    }

    const questions = await Question.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('author', 'username profilePicture reputation')
      .populate('answers');

    const total = await Question.countDocuments(query);

    res.json({
      questions,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page)
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single question
exports.getQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate('author', 'username profilePicture reputation')
      .populate({
        path: 'answers',
        populate: {
          path: 'author',
          select: 'username profilePicture reputation'
        }
      });

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.json(question);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a question
exports.createQuestion = async (req, res) => {
  try {
    const { title, body, tags } = req.body;

    const question = new Question({
      title,
      body,
      tags,
      author: req.userId
    });

    await question.save();

    // Add question to user's questions array
    await User.findByIdAndUpdate(req.userId, {
      $push: { questions: question._id }
    });

    res.status(201).json(question);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a question
exports.updateQuestion = async (req, res) => {
  try {
    const { title, body, tags } = req.body;

    const question = await Question.findOneAndUpdate(
      { _id: req.params.id, author: req.userId },
      { title, body, tags },
      { new: true }
    );

    if (!question) {
      return res.status(404).json({ message: 'Question not found or unauthorized' });
    }

    res.json(question);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a question
exports.deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findOneAndDelete({
      _id: req.params.id,
      author: req.userId
    });

    if (!question) {
      return res.status(404).json({ message: 'Question not found or unauthorized' });
    }

    // Remove question from user's questions array
    await User.findByIdAndUpdate(req.userId, {
      $pull: { questions: question._id }
    });

    // Delete all answers associated with the question
    await Answer.deleteMany({ question: question._id });

    res.json({ message: 'Question deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Vote on a question
exports.voteQuestion = async (req, res) => {
  try {
    const { voteType } = req.body;
    const questionId = req.params.id;
    const userId = req.userId;

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Check if user already voted
    const existingVote = question.voters.find(v => v.user.toString() === userId);
    
    if (existingVote) {
      // If same vote type, remove vote
      if (existingVote.voteType === voteType) {
        question.voters = question.voters.filter(v => v.user.toString() !== userId);
        question.votes += voteType === 'up' ? -1 : 1;
      } else {
        // If different vote type, update vote
        existingVote.voteType = voteType;
        question.votes += voteType === 'up' ? 2 : -2;
      }
    } else {
      // Add new vote
      question.voters.push({ user: userId, voteType });
      question.votes += voteType === 'up' ? 1 : -1;
    }

    await question.save();
    res.json(question);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};