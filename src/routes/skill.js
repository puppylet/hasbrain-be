const express = require('express');
const router = express.Router();

const skill = require('../controllers/skill');

router.get('/', skill.findAll);
router.get('/:id', skill.findOne);
router.put('/', skill.update);
router.put('/:id', skill.update);
router.post('/', skill.create);
router.delete('/', skill.remove);
router.delete('/:id', skill.remove);


module.exports = router;
