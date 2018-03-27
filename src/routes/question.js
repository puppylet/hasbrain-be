const express = require('express');
const router = express.Router();

const question = require('../controllers/question');

router.get('/', question.findAll);
router.get('/:id', question.findOne);
router.post('/', question.create);
router.put('/:id', question.update);
router.delete('/', question.remove);
router.delete('/:id', question.remove);


module.exports = router;