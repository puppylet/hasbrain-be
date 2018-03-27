const express = require('express');
const router = express.Router();

const answer = require('../controllers/answer');

router.get('/', answer.findAll);
router.get('/:profile/:skill', answer.start);
router.post('/answer', answer.answer);
router.get('/:id', answer.findOne);
router.post('/', answer.create);
router.post('/next', answer.next);
router.put('/', answer.update);
router.put('/:id', answer.update);
router.delete('/', answer.remove);
router.delete('/:id', answer.remove);


module.exports = router;