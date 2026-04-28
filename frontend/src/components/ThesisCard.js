import React from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const DEPT_COLORS = {
  'CSE':         'bg-blue-50 text-blue-700 border-blue-200',
  'EEE':         'bg-yellow-50 text-yellow-700 border-yellow-200',
  'BBA':         'bg-green-50 text-green-700 border-green-200',
  'ECE':         'bg-purple-50 text-purple-700 border-purple-200',
  'MATHEMATICS': 'bg-pink-50 text-pink-700 border-pink-200',
};

const getDeptColor = (dept) =>
  DEPT_COLORS[dept?.toUpperCase()] || 'bg-gray-50 text-gray-600 border-gray-200';

const DEPT_BAR = {
  'CSE':         'bg-blue-500',
  'EEE':         'bg-yellow-500',
  'ECE':         'bg-purple-500',
  'MATHEMATICS': 'bg-pink-500',
};
const getDeptBar = (dept) => DEPT_BAR[dept?.toUpperCase()] || 'bg-gray-300';

export default function ThesisCard({ thesis, onDelete, isSupervisor = false }) {
  const {
    _id, thesisTitle, abstract, department, yearDefended,
    studentName, supervisorName, keywords, views,
  } = thesis;

  const truncated = abstract?.length > 160 ? abstract.slice(0, 160) + '…' : abstract;

  // Use backend signed URL route instead of direct Cloudinary URL
  const pdfViewUrl = `${API_URL}/archive/pdf/${_id}`;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col">
      <div className={`h-1 rounded-t-2xl ${getDeptBar(department)}`} />

      <div className="p-5 flex flex-col flex-1 gap-3">
        <div className="flex items-start justify-between gap-2">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getDeptColor(department)}`}>
            {department}
          </span>
          <span className="text-xs text-gray-400 font-medium">{yearDefended}</span>
        </div>

        <h3 className="text-sm font-bold text-gray-800 leading-snug line-clamp-2">
          {thesisTitle}
        </h3>

        <p className="text-xs text-gray-500 leading-relaxed flex-1">{truncated}</p>

        {keywords?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {keywords.slice(0, 4).map((kw, i) => (
              <span key={i} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                {kw}
              </span>
            ))}
          </div>
        )}

        <div className="text-xs text-gray-500 space-y-0.5 border-t border-gray-50 pt-3">
          <p><span className="font-medium text-gray-700">Student:</span> {studentName}</p>
          <p><span className="font-medium text-gray-700">Supervisor:</span> {supervisorName}</p>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-gray-400">{views ?? 0} views</span>
          <div className="flex items-center gap-2">
            {isSupervisor && (
              <button
                onClick={() => onDelete(_id)}
                className="text-xs text-red-400 hover:text-red-600 transition-colors"
              >
                Remove
              </button>
            )}
            <a
              href={pdfViewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
            >
              <span>↗</span> View PDF
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}