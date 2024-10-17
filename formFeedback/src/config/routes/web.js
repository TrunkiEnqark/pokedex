const express = require('express');
const { getFeedback, getDataDisplay } = require('../../controller/homeController.js');

const router = express.Router();

router.get('/', getFeedback);
router.get('/display-data', getDataDisplay); // displaying data

module.exports = router;
