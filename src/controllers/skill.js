const mongoose = require('mongoose');
const uuid = require('uuid');
const Skill = mongoose.model('Skill')
const AWS = require('aws-sdk')
const s3Config = require('../config/s3')


const s3 = new AWS.S3(options = {
  accessKeyId: s3Config.key,
  secretAccessKey: s3Config.secret,
  region: s3Config.region
});

module.exports = {
  create: (req, res) => {
    const project_id = req.project.id
    if (!project_id) return res.status(401).end();

    const {body} = req;
    const base64Data = new Buffer(body.image.replace(/^data:image\/\w+;base64,/, ""),'base64')
    const type = body.image.split(';')[0].split('/')[1]

    const params = {
      Bucket: s3Config.bucket,
      Key: uuid.v1(),
      UploadId: uuid.v1(),
      Body: base64Data,
      ACL: 'public-read',
      ContentEncoding: 'base64', // required
      ContentType: `image/${type}` // required. Notice the back ticks
    }

    s3.upload(params, (err, data) => {
      if (err) { return res.status(500).send(err)}
      else {
        const skill = new Skill({
          title: body.title,
          description: body.description
        })
        skill.project_id = project_id
        skill.created_at = new Date();
        skill.photo = data.Location

        skill.save()
          .then(doc => res.status(201).send(doc))
          .catch(err => res.status(500).send(err))
      }
    });
  },

  findAll: (req, res) => {
    const project_id = req.project.id
    if (!project_id) return res.status(401).end();

    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 10;
    const offset = (page - 1) * limit;
    const query = {project_id};

    Skill.count(query)
      .then(total => Skill.find(query).limit(limit).skip(offset).sort({_id: -1})
        .then(docs => res.status(200).send({result: docs, total}))
        .catch(err => res.status(500).send(err)))
      .catch(err => res.status(500).send(err));
  },

  findOne: (req, res) => {
    const project_id = req.project.id
    if (!project_id) return res.status(401).end();

    const _id = req.params.id;

    Skill.findOne({project_id, _id})
      .then(doc => !doc ? res.status(404).send({error: 'Skill does not exist'}) : res.status(200).send(doc))
      .catch(err => res.status(500).send({error: err}));
  },

  update: (req, res) => {
    const project_id = req.project.id
    if (!project_id) return res.status(401).end();

    const _id = req.params.id;
    const {body} = req;
    const newData = {
      title: body.title,
      description: body.description,
      updated_at: new Date()
    }
    if (body.image) {
      const base64Data = new Buffer(body.image.replace(/^data:image\/\w+;base64,/, ""),'base64')
      const type = body.image.split(';')[0].split('/')[1]

      const params = {
        Bucket: s3Config.bucket,
        Key: uuid.v1(),
        UploadId: uuid.v1(),
        Body: base64Data,
        ACL: 'public-read',
        ContentEncoding: 'base64', // required
        ContentType: `image/${type}` // required. Notice the back ticks
      }

      s3.upload(params, (err, data) => {
        if (err) { return res.status(500).send(err)}
        else {
          newData.photo = data.Location

          Skill.update({project_id, _id: {$in: _id}}, newData)
            .then(doc => !doc
              ? res.status(404).send({error: 'Skill does not exist'})
              : res.status(200).send({status: true, message: "Update successfully"}))
            .catch(err => res.status(500).send({error: err}));
        }
      });

    }


    Skill.update({project_id, _id: {$in: _id}}, newData)
      .then(doc => !doc
        ? res.status(404).send({error: 'Skill does not exist'})
        : res.status(200).send({status: true, message: "Update successfully"}))
      .catch(err => res.status(500).send({error: err}));
  },

  remove: (req, res) => {
    const project_id = req.project.id
    if (!project_id) return res.status(401).end();

    const _id = req.body.id || req.params.id;
    let body = req.body;
    body.updated_at = new Date();

    Skill.remove({project_id, _id: {$in: _id}})
      .then(doc => !doc ? res.status(404).send({error: 'Skill does not exist'}) : res.status(200).send(doc))
      .catch(err => res.status(500).send({error: err}));
  }
}