// src/components/Common/Modal.jsx
import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl'
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-all duration-500">
      <div className={`bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto transform transition-all duration-500 scale-95 hover:scale-100`}>
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <h3 className="text-xl font-bold text-[#102C57]">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/50 rounded-2xl transition-all duration-300 transform hover:rotate-90"
          >
            <X className="h-5 w-5 text-[#102C57]" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;