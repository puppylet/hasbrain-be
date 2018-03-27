const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const skillSchema = new Schema({
  project_id: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  photo: {
    type: String,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now()
  }
});

module.epxorts = mongoose.model('Skill', skillSchema);
