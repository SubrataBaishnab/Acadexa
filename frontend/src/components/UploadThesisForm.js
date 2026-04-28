import React, { useState } from 'react';
import { uploadThesis } from '../services/thesisArchiveService';

// Replace with auth context later
const DUMMY_SUPERVISOR = {
  supervisorId: 'supervisor_001',
  supervisorName: 'Dr. Rahman',
};

const DEPARTMENTS = ['CSE', 'EEE', 'ECE', 'BBA', 'Mathematics', 'Physics', 'Other'];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 10 }, (_, i) => CURRENT_YEAR - i);

export default function UploadThesisForm({ onUploadSuccess }) {
  const [form, setForm] = useState({
    thesisTitle: '',
    abstract: '',
    department: '',
    yearDefended: String(CURRENT_YEAR),
    studentName: '',
    keywords: '',
  });
  const [pdfFile, setPdfFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type !== 'application/pdf') {
      setError('Only PDF files are allowed.');
      return;
    }
    setPdfFile(file || null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.thesisTitle || !form.abstract || !form.department || !form.studentName) {
      return setError('Please fill in all required fields.');
    }
    if (!pdfFile) {
      return setError('Please attach the thesis PDF.');
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append('pdf', pdfFile);
      data.append('thesisTitle', form.thesisTitle);
      data.append('abstract', form.abstract);
      data.append('department', form.department);
      data.append('yearDefended', form.yearDefended);
      data.append('studentName', form.studentName);
      data.append('keywords', form.keywords);
      data.append('supervisorId', DUMMY_SUPERVISOR.supervisorId);
      data.append('supervisorName', DUMMY_SUPERVISOR.supervisorName);

      await uploadThesis(data);
      setSuccess('Thesis published to archive!');
      setForm({ thesisTitle: '', abstract: '', department: '', yearDefended: String(CURRENT_YEAR), studentName: '', keywords: '' });
      setPdfFile(null);
      setTimeout(() => { if (onUploadSuccess) onUploadSuccess(); }, 800);
    } catch (err) {
      setError(err?.response?.data?.error || 'Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h2 className="text-lg font-bold text-gray-800 mb-0.5">Publish Thesis to Archive</h2>
      <p className="text-xs text-gray-400 mb-5">Upload a defended and approved thesis for future students to reference</p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 mb-4 text-sm">{error}</div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 mb-4 text-sm">{success}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Thesis Title *</label>
          <input
            name="thesisTitle"
            value={form.thesisTitle}
            onChange={handleChange}
            placeholder="Full thesis title..."
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
          />
        </div>

        {/* Abstract */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Abstract *</label>
          <textarea
            name="abstract"
            value={form.abstract}
            onChange={handleChange}
            rows={4}
            placeholder="Brief summary of the thesis..."
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 resize-none"
          />
        </div>

        {/* Row: student name + department + year */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Student Name *</label>
            <input
              name="studentName"
              value={form.studentName}
              onChange={handleChange}
              placeholder="Full name"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Department *</label>
            <select
              name="department"
              value={form.department}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            >
              <option value="">Select...</option>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Year Defended *</label>
            <select
              name="yearDefended"
              value={form.yearDefended}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            >
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        {/* Keywords */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Keywords <span className="font-normal text-gray-400">(comma-separated)</span>
          </label>
          <input
            name="keywords"
            value={form.keywords}
            onChange={handleChange}
            placeholder="machine learning, NLP, computer vision..."
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
          />
        </div>

        {/* PDF Upload */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Thesis PDF *</label>
          <label className="flex items-center gap-3 border-2 border-dashed border-gray-200 hover:border-blue-400 rounded-xl px-4 py-4 cursor-pointer transition-colors bg-gray-50 hover:bg-blue-50">
            <span className="text-2xl">📄</span>
            <div>
              <p className="text-sm font-medium text-gray-700">
                {pdfFile ? pdfFile.name : 'Click to attach PDF'}
              </p>
              <p className="text-xs text-gray-400">Max 20MB · PDF only</p>
            </div>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
        >
          {loading ? 'Uploading...' : 'Publish to Archive'}
        </button>
      </form>
    </div>
  );
}