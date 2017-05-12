'use strict';

var express = require('express');
var controller = require('./item.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/:name', controller.show);
router.post('/', controller.create);
router.put('/:name', controller.upsert);
router.patch('/:name', controller.patch);
router.delete('/:name', controller.destroy);

module.exports = router;
