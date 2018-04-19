const mongoose = require('mongoose');
const Bookmark = mongoose.model('Bookmark')

module.exports = {
  create: function (req, res) {
    const project_id = req.project.id
    if (!project_id) return res.status(401).end();

    const body = req.body;
    const bookmark = new Bookmark(body)
    bookmark.project_id = project_id
    bookmark.created_at = new Date();

    bookmark.save()
      .then(doc => res.status(201).send(doc))
      .catch(err => res.status(500).send(err))
  },

  findAll: function (req, res) {
    const project_id = req.project.id
    if (!project_id) return res.status(401).end();

    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 10;
    const offset = (page - 1) * limit;
    const query = {project_id};

    if (req.query.completed) query.completed = req.query.completed === 'true'
    if (req.query.profile_id) query.completed = req.query.profile_id === req.query.profile_id

    Bookmark.count(query)
      .then(total => Bookmark.find(query).limit(limit).skip(offset).sort({_id: -1})
        .then(docs => res.status(200).send({result: docs, total}))
        .catch(err => res.status(500).send(err)))
      .catch(err => res.status(500).send(err));
  },

  complete: (req, res) => {
    const project_id = req.project.id
    if (!project_id) return res.status(401).end();

    const _id = req.query.id
    const query = {project_id, _id};

    Bookmark.update(query, {completed: true})
      .then(doc => !doc
        ? res.status(404).send({error: 'Bookmark does not exist'})
        : res.status(200).send({status: true, message: "Set completed successfully"}))
      .catch(err => res.status(500).send({error: err}));
  },

  findOne: function (req, res) {
    const project_id = req.project.id
    if (!project_id) return res.status(401).end();

    const _id = req.params.id;

    Bookmark.findOne({project_id, _id})
      .then(doc => !doc ? res.status(404).send({error: 'Bookmark does not exist'}) : res.status(200).send(doc))
      .catch(err => res.status(500).send({error: err}));
  },

  update: function (req, res) {

    const project_id = req.project.id;
    if (!project_id) return res.status(401).end();
    const _id = req.params.id;
    let body = req.body

    body.updated_at = new Date();

    Bookmark.update({project_id, _id: {$in: _id}}, body)
      .then(doc => !doc
        ? res.status(404).send({error: 'Bookmark does not exist'})
        : res.status(200).send({status: true, message: "Deleted successfully"}))
      .catch(err => res.status(500).send({error: err}));
  },

  remove: function (req, res) {
    const project_id = req.project.id;
    if (!project_id) return res.status(401).end();

    const _id = req.body.id || req.params.id;

    let body = req.body;
    body.updated_at = new Date();

    Bookmark.remove({project_id, _id: {$in: _id}})
      .then(doc => !doc ? res.status(404).send({error: 'Bookmark does not exist'}) : res.status(200).send(doc))
      .catch(err => res.status(500).send({error: err}));
  }
}