const express = require('express');
const router = express.Router();

const bookmark = require('../controllers/bookmark');

router.get('/', bookmark.findAll);
router.get('/:id', bookmark.findOne);
router.post('/', bookmark.create);
router.put('/completed/:id', bookmark.update);
router.put('/:id', bookmark.update);
router.delete('/', bookmark.remove);
router.delete('/:id', bookmark.remove);


module.exports = router;