const mongoose = require('mongoose');
const Question = mongoose.model('Question')

module.exports = {
  create: function (req, res) {
    const project_id = req.project.id
    if (!project_id) return res.status(401).end();

    const body = req.body;
    const question = new Question(body)
    question.project_id = project_id
    question.created_at = new Date();

    question.save()
      .then(doc => res.status(201).send(doc))
      .catch(err => res.status(500).send(err))
  },

  findAll: function (req, res) {
    const project_id = req.project.id
    console.log(project_id)
    if (!project_id) return res.status(401).end();

    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 10;
    const offset = (page - 1) * limit;
    const query = {project_id};
    let total;

    Question.count(query)
      .then(total => Question.find(query).limit(limit).skip(offset).sort({_id: -1})
        .then(docs => res.status(200).send({result: docs, total}))
        .catch(err => res.status(500).send(err)))
      .catch(err => res.status(500).send(err));
  },

  findOne: function (req, res) {
    const project_id = req.project.id
    if (!project_id) return res.status(401).end();

    const _id = req.params.id;

    Question.findOne({project_id, _id})
      .then(doc => !doc ? res.status(404).send({error: 'Question does not exist'}) : res.status(200).send(doc))
      .catch(err => res.status(500).send({error: err}));
  },

  update: function (req, res) {

    const project_id = req.project.id;
    if (!project_id) return res.status(401).end();
    console.log('ahjkahkas')
    const _id = req.params.id;
    let body = req.body

    body.updated_at = new Date();

    Question.update({project_id, _id: {$in: _id}}, body)
      .then(doc => !doc
        ? res.status(404).send({error: 'Question does not exist'})
        : res.status(200).send({status: true, message: "Deleted successfully"}))
      .catch(err => res.status(500).send({error: err}));
  },

  remove: function (req, res) {
    const project_id = req.project.id;
    if (!project_id) return res.status(401).end();

    const _id = req.body.id || req.params.id;
    let body = req.body;
    body.updated_at = new Date();

    Question.remove({project_id, _id: {$in: _id}})
      .then(doc => !doc ? res.status(404).send({error: 'Question does not exist'}) : res.status(200).send(doc))
      .catch(err => res.status(500).send({error: err}));
  }
}