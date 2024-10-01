const express = require('express');
const { getHomepage, getTAK } = require('../../controller/homeController.js');
// router.Method('route',handler)

const router = express.Router();
router.get('/', getHomepage);

router.get('/tak', getTAK);

module.exports = router;// export router defaults 
