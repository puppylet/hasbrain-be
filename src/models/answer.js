const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const answerSchema = new Schema({
  project_id: {
    type: String,
    required: true
  },
  profile_id: {
    type: String,
    required: true
  },
  skill_id: {
    type: String,
    required: true
  },
  questions: {
    type: Array,
    required: true
  },
  answers: {
    type: Array,
    default: []
  },
  started: {
    type: Date,
    default: Date.now()
  },
  currentTimeout: {
    type: Number
  },
  created_at: {
    type: Date,
    default: Date.now()
  },
  finished: {
    type: Boolean,
    default: false
  },
  score: {
    type: Number,
    default: 0
  },
  currentLevel: {
    type: Number,
    default: 1
  }
});

module.epxorts = mongoose.model('Answer', answerSchema);
