const mongoose = require('mongoose');

const thesisArchiveSchema = new mongoose.Schema({
  thesisTitle:    { type: String, required: true, trim: true },
  abstract:       { type: String, required: true, trim: true },
  department:     { type: String, required: true, trim: true },
  yearDefended:   { type: Number, required: true },
  keywords:       [{ type: String, trim: true }],

  studentName:    { type: String, required: true, trim: true },
  supervisorId:   { type: String, required: true },
  supervisorName: { type: String, required: true, trim: true },

  pdfUrl:         { type: String, required: true },
  pdfPublicId:    { type: String, required: true },

  views: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Full-text search index
thesisArchiveSchema.index({
  thesisTitle:    'text',
  abstract:       'text',
  studentName:    'text',
  supervisorName: 'text',
  keywords:       'text',
  department:     'text',
});

thesisArchiveSchema.index({ yearDefended: -1 });
thesisArchiveSchema.index({ department: 1 });

// Use async — no next() needed
thesisArchiveSchema.pre('save', async function () {
  this.updatedAt = Date.now();
});

module.exports = mongoose.model('ThesisArchive', thesisArchiveSchema);