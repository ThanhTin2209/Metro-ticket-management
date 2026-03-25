import React from 'react';

const Button = ({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary', 
  disabled = false, 
  className = '', 
  loading = false 
}) => {
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95',
    secondary: 'bg-slate-500 text-white hover:bg-slate-600 active:scale-95',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:scale-95',
    success: 'bg-green-600 text-white hover:bg-green-700 active:scale-95',
    outline: 'bg-transparent border-2 border-blue-600 text-blue-600 hover:bg-blue-50 active:scale-95',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${variants[variant]} ${disabled || loading ? 'opacity-50 cursor-not-allowed transform-none' : ''} ${className}`}
    >
      {loading && (
        <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;
