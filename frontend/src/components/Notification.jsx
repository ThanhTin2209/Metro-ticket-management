import React, { useState, useEffect } from 'react';

const Notification = ({ message, type = 'info', duration = 3000, onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300); // Wait for fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const styles = {
    info: 'bg-blue-600',
    error: 'bg-red-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-500',
  };

  return (
    <div
      className={`fixed bottom-4 right-4 text-white px-6 py-3 rounded-xl shadow-2xl transition-all duration-300 transform flex items-center gap-3 z-50 ${visible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} ${styles[type]}`}
    >
      <div className="flex-1 font-medium">{message}</div>
      <button onClick={() => setVisible(false)} className="hover:opacity-70">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>
  );
};

export default Notification;
