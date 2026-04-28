import React from 'react';

// Interactive star picker
export function StarPicker({ value = 0, onChange, size = 'md' }) {
  const sizes = { sm: 'text-lg', md: 'text-2xl', lg: 'text-3xl' };
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className={`${sizes[size]} transition-transform hover:scale-110 focus:outline-none`}
        >
          <span className={star <= value ? 'text-yellow-400' : 'text-gray-200'}>★</span>
        </button>
      ))}
    </div>
  );
}

// Read-only star display
export function StarDisplay({ value = 0, size = 'sm', showNumber = false }) {
  const sizes = { sm: 'text-sm', md: 'text-base', lg: 'text-xl' };
  const filled = Math.round(value);
  return (
    <span className={`inline-flex items-center gap-0.5 ${sizes[size]}`}>
      {[1, 2, 3, 4, 5].map(star => (
        <span key={star} className={star <= filled ? 'text-yellow-400' : 'text-gray-200'}>★</span>
      ))}
      {showNumber && <span className="ml-1 text-gray-500 text-xs font-medium">{Number(value).toFixed(1)}</span>}
    </span>
  );
}