'use client';

import { X, AlertTriangle, CheckCircle, Info, HelpCircle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  type?: 'danger' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
  onClose: () => void;
}

export default function ConfirmDialog({
  isOpen,
  type = 'warning',
  title,
  message,
  confirmText = 'Ya',
  cancelText = 'Batal',
  showCancel = true,
  onConfirm,
  onCancel,
  onClose,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  // Visual customizer based on type
  const typeConfig = {
    danger: {
      icon: <AlertTriangle className="text-red-600" size={24} />,
      bgIcon: 'bg-red-100',
      btnConfirm: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 shadow-red-200',
    },
    warning: {
      icon: <AlertTriangle className="text-amber-600" size={24} />,
      bgIcon: 'bg-amber-100',
      btnConfirm: 'bg-primary hover:bg-primary-dark text-white focus:ring-primary shadow-primary/20',
    },
    success: {
      icon: <CheckCircle className="text-green-600" size={24} />,
      bgIcon: 'bg-green-100',
      btnConfirm: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500 shadow-green-200',
    },
    info: {
      icon: <Info className="text-blue-600" size={24} />,
      bgIcon: 'bg-blue-100',
      btnConfirm: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 shadow-blue-200',
    },
  };

  const currentType = typeConfig[type] || typeConfig.warning;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Dialog Card */}
      <div className="relative bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl border border-gray-100 transform scale-100 transition-all duration-300 animate-in fade-in zoom-in-95 duration-200 z-10">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition"
        >
          <X size={18} />
        </button>

        {/* Content */}
        <div className="flex gap-4 items-start mt-1">
          <div className={`p-3 rounded-2xl shrink-0 ${currentType.bgIcon}`}>
            {currentType.icon}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-charcoal leading-tight mb-2">
              {title}
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end mt-6">
          {showCancel && (
            <button
              onClick={() => {
                if (onCancel) onCancel();
                onClose();
              }}
              className="px-4 py-2.5 text-sm font-semibold text-gray-600 hover:text-charcoal hover:bg-gray-50 border border-gray-200 rounded-xl transition cursor-pointer"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={() => {
              if (onConfirm) onConfirm();
              onClose();
            }}
            className={`px-5 py-2.5 text-sm font-bold rounded-xl transition cursor-pointer shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${currentType.btnConfirm}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
