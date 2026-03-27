import React from 'react';

const Input = ({ label, error, className = '', ...props }) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 ml-1">
          {label}
        </label>
      )}
      <input
        className={`w-full bg-white border border-zinc-100 rounded-2xl px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all ${
          error ? 'border-rose-200 bg-rose-50/30' : ''
        }`}
        {...props}
      />
      {error && (
        <p className="text-[10px] font-medium text-rose-500 ml-1">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
