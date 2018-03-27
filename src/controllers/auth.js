const jwt = require('jsonwebtoken');

const mongoose = require('mongoose');
const Company = mongoose.model('Project');

module.exports = {

  requestToken: function (req, res) {
    Company.findOne({
      secret_key: req.query.secret_key
    }).then(function (doc) {
      if (!doc) return res.status(404).send({error: 'Project not exist'});

      return res.status(200).send({
        token: jwt.sign({
          id: doc._id,
          exp: Date.now() + 86400 * 7
        }, process.env.CLIENT_SECRET_KEY)
      });
    }).catch(err => {
      return res.status(500).send({error: err});
    });
  }

};
