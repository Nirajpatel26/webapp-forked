const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const multer = require('multer');
const methodNotAllowed = require('../middleware/methodnotallowed')
const singleFileMiddleware = require('../middleware/singleFileMiddleware')
const checkEmptyPayload =require('../middleware/checkEmptyPayload')

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Routes
router.post('/v1/file', singleFileMiddleware, fileController.addFile);
router.get('/v1/file',checkEmptyPayload, fileController.badRequest);
router.delete('/v1/file', fileController.badRequest);
router.head('/v1/file', methodNotAllowed);
router.options('/v1/file', methodNotAllowed);
router.patch('/v1/file', methodNotAllowed);
router.put('/v1/file', methodNotAllowed);

router.get('/v1/file/:id', checkEmptyPayload,fileController.getFile);
router.delete('/v1/file/:id', checkEmptyPayload,fileController.deleteFile);
router.head('/v1/file/:id', methodNotAllowed);
router.options('/v1/file/:id', methodNotAllowed);
router.patch('/v1/file/:id', methodNotAllowed);
router.put('/v1/file/:id', methodNotAllowed);
router.post('/v1/file/:id', methodNotAllowed);

module.exports = router;
