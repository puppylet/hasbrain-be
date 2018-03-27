const uuid = require('uuid');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.epxorts = mongoose.model('Project', new Schema({
  userkit_project_id: String,
  secret_key: {
    type: String,
    default: uuid.v1()
  },
  token: String,
  extend_days: {
    type: Number,
    default: 1
  },
  decipher: {
    algorithm: String,
    key: String
  },
  created_at: {
    type: Date,
    default: Date.now()
  }
}));
