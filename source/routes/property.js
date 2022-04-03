const express = require('express');
const router = express.Router();
const multer = require('multer');

// ----------SETUP MULTER------------
const maxfileSize = 20000000 // 20MB
const storage = multer.memoryStorage()
const upload = multer({ 
  storage: storage,
  limits: { fileSize: maxfileSize }
});

const propertyController = require('../controllers/propertyController');

router.get('/', propertyController.show);

router.get('/page/:currentPage', propertyController.loadProperties);

router.get('/:id', propertyController.loadProperty);


module.exports = router;