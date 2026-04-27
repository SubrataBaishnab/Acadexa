import React, { useState } from 'react';

const ContactModal = ({ professor, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(professor.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            Prof. {professor.firstName} {professor.lastName}
          </h2>
          <p className="text-gray-600">{professor.university}</p>
        </div>

        {/* Contact Information */}
        <div className="bg-purple-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600 mb-2">Email Address</p>
          <p className="text-lg font-mono text-gray-900 break-all">{professor.email}</p>
        </div>

        {/* Department and Designation */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {professor.designation && (
            <div>
              <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Designation</p>
              <p className="text-sm text-gray-900">{professor.designation}</p>
            </div>
          )}
          {professor.department && (
            <div>
              <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Department</p>
              <p className="text-sm text-gray-900">{professor.department}</p>
            </div>
          )}
        </div>

        {/* Research Areas */}
        {professor.researchAreas && professor.researchAreas.length > 0 && (
          <div className="mb-6">
            <p className="text-sm text-gray-600 font-semibold uppercase mb-2">Research Areas</p>
            <div className="flex flex-wrap gap-2">
              {professor.researchAreas.map((area, idx) => (
                <span
                  key={idx}
                  className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full"
                >
                  {area}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleCopyEmail}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            {copied ? 'Email Copied!' : 'Copy Email'}
          </button>

          {professor.universityProfileUrl && (
            <button
              onClick={() => window.open(professor.universityProfileUrl, '_blank')}
              className="w-full border border-purple-600 text-purple-600 hover:bg-purple-50 font-semibold py-2 rounded-lg transition-colors"
            >
              View University Profile
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactModal;
