const ThesisArchive = require('../models/ThesisArchive');
const cloudinary = require('../utils/cloudinary');
const streamifier = require('streamifier');

// Helper: stream buffer to Cloudinary
const uploadToCloudinary = (buffer) =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'raw',  // raw is correct for PDFs
        folder: 'thesis_archive',
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });

// ─────────────────────────────────────────────
// POST /api/archive
// ─────────────────────────────────────────────
const uploadThesis = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'PDF file is required.' });

    const {
      thesisTitle, abstract, department, yearDefended,
      studentName, supervisorId, supervisorName, keywords,
    } = req.body;

    if (!thesisTitle || !abstract || !department || !yearDefended || !studentName || !supervisorId || !supervisorName) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const cloudResult = await uploadToCloudinary(req.file.buffer);

    const thesis = new ThesisArchive({
      thesisTitle,
      abstract,
      department,
      yearDefended: Number(yearDefended),
      studentName,
      supervisorId,
      supervisorName,
      keywords: keywords
        ? keywords.split(',').map(k => k.trim()).filter(Boolean)
        : [],
      pdfUrl:      cloudResult.secure_url,
      pdfPublicId: cloudResult.public_id,
    });

    await thesis.save();
    res.status(201).json({ message: 'Thesis published to archive.', thesis });
  } catch (err) {
    console.error('uploadThesis error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────
// GET /api/archive/pdf/:id
// Fetches PDF from Cloudinary and streams it to browser inline (no download)
// ─────────────────────────────────────────────
const getPdfUrl = async (req, res) => {
  try {
    const thesis = await ThesisArchive.findById(req.params.id);
    if (!thesis) return res.status(404).json({ error: 'Thesis not found.' });

    // Fetch the PDF from Cloudinary
    const response = await fetch(thesis.pdfUrl);
    if (!response.ok) {
      return res.status(502).json({ error: 'Failed to fetch PDF from storage.' });
    }

    const contentLength = response.headers.get('content-length');

    // Tell browser to display inline, not download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${thesis.thesisTitle.replace(/[^a-z0-9]/gi, '_')}.pdf"`);
    if (contentLength) res.setHeader('Content-Length', contentLength);

    // Stream PDF bytes directly to the browser
    const { Readable } = require('stream');
    Readable.fromWeb(response.body).pipe(res);
  } catch (err) {
    console.error('getPdfUrl error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────
// GET /api/archive
// ─────────────────────────────────────────────
const getTheses = async (req, res) => {
  try {
    const { search, department, year, page = 1, limit = 12 } = req.query;
    const query = {};

    if (department && department !== 'All') query.department = department;
    if (year && year !== 'All') query.yearDefended = Number(year);

    if (search && search.trim()) {
      const term = search.trim();
      try {
        await ThesisArchive.countDocuments({ $text: { $search: term } });
        query.$text = { $search: term };
      } catch {
        const regex = new RegExp(term, 'i');
        query.$or = [
          { thesisTitle:    regex },
          { abstract:       regex },
          { studentName:    regex },
          { supervisorName: regex },
          { keywords:       regex },
          { department:     regex },
        ];
      }
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await ThesisArchive.countDocuments(query);
    const theses = await ThesisArchive.find(query)
      .sort({ yearDefended: -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .select('-pdfPublicId');

    res.json({ theses, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    console.error('getTheses error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────
// GET /api/archive/meta/filters
// ─────────────────────────────────────────────
const getFilterMeta = async (req, res) => {
  try {
    const departments = await ThesisArchive.distinct('department');
    const years = await ThesisArchive.distinct('yearDefended');
    res.json({
      departments: departments.filter(Boolean).sort(),
      years: years.filter(Boolean).sort((a, b) => b - a),
    });
  } catch (err) {
    console.error('getFilterMeta error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────
// GET /api/archive/:id
// ─────────────────────────────────────────────
const getThesisById = async (req, res) => {
  try {
    const thesis = await ThesisArchive.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).select('-pdfPublicId');
    if (!thesis) return res.status(404).json({ error: 'Thesis not found.' });
    res.json(thesis);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────
// DELETE /api/archive/:id
// ─────────────────────────────────────────────
const deleteThesis = async (req, res) => {
  try {
    const thesis = await ThesisArchive.findById(req.params.id);
    if (!thesis) return res.status(404).json({ error: 'Thesis not found.' });

    await cloudinary.uploader.destroy(thesis.pdfPublicId, { resource_type: 'raw' });
    await thesis.deleteOne();
    res.json({ message: 'Thesis removed from archive.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  uploadThesis,
  getPdfUrl,
  getTheses,
  getThesisById,
  deleteThesis,
  getFilterMeta,
};