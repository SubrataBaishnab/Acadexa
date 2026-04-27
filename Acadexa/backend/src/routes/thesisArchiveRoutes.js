const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  uploadThesis,
  getPdfUrl,
  getTheses,
  getThesisById,
  deleteThesis,
  getFilterMeta,
} = require('../controllers/thesisArchiveController');

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files are allowed.'), false);
  },
});

// Specific routes BEFORE /:id
router.get('/meta/filters', getFilterMeta);       // GET /api/archive/meta/filters
router.get('/pdf/:id',      getPdfUrl);           // GET /api/archive/pdf/:id  ← signed URL redirect

router.get('/',             getTheses);           // GET /api/archive
router.post('/',            upload.single('pdf'), uploadThesis); // POST /api/archive
router.get('/:id',          getThesisById);       // GET /api/archive/:id
router.delete('/:id',       deleteThesis);        // DELETE /api/archive/:id

module.exports = router;