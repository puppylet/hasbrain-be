const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const questionSchema = new Schema({
  project_id: {
    type: String,
    required: true
  },
  question: {
    type: String,
    required: true
  },
  timedOut: {
    type: Number,
    required: true
  },
  point: {
    type: Number,
    required: true
  },
  level: {
    type: Number,
    required: true
  },
  options: {
    type: Array,
    required: true
  },
  answer: {
    type: Number,
    required: true
  },
  tags: {
    type: Array,
    required: true
  },
  skill_id: {
    type: String,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now()
  }
});

module.epxorts = mongoose.model('Question', questionSchema);
