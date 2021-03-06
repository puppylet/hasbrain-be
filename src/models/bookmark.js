const uuid = require('uuid');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.epxorts = mongoose.model('Bookmark', new Schema({
  project_id: {
    type: String,
    required: true
  },
  profile_id: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  photo: {
    type: String,
    default: null
  },
  description: {
    type: String,
    required: true
  },
  completed: {
    type: Boolean,
    default: false,
  },
  status: {
    type: Number,
    default: 1,
  },
  created_at: {
    type: Date,
    default: Date.now()
  }
}));
