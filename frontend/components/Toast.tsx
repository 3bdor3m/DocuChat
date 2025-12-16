import { useEffect } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimesCircle, FaTimes } from 'react-icons/fa';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ id, type, title, message, duration = 5000, onClose }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FaCheckCircle className="text-green-400" size={20} />;
      case 'error':
        return <FaTimesCircle className="text-red-400" size={20} />;
      case 'warning':
        return <FaExclamationCircle className="text-yellow-400" size={20} />;
      case 'info':
        return <FaInfoCircle className="text-blue-400" size={20} />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success':
        return 'border-green-500/30 bg-green-500/10';
      case 'error':
        return 'border-red-500/30 bg-red-500/10';
      case 'warning':
        return 'border-yellow-500/30 bg-yellow-500/10';
      case 'info':
        return 'border-[#2873ec]/30 bg-[#2873ec]/10';
    }
  };

  return (
    <div
      className={`
        relative w-full max-w-sm backdrop-blur-xl border rounded-2xl p-4 shadow-2xl
        ${getColors()}
        animate-in slide-in-from-right-full fade-in duration-300
      `}
    >
      {/* Close button */}
      <button
        onClick={() => onClose(id)}
        className="absolute top-3 left-3 text-gray-400 hover:text-white transition-colors"
      >
        <FaTimes size={14} />
      </button>

      {/* Content */}
      <div className="flex items-start gap-3 pr-6">
        <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-medium text-sm mb-1">{title}</h4>
          <p className="text-gray-300 text-xs leading-relaxed">{message}</p>
        </div>
      </div>

      {/* Progress bar */}
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 rounded-b-2xl overflow-hidden">
          <div
            className="h-full bg-white/30"
            style={{
              animation: `shrink ${duration}ms linear forwards`,
            }}
          />
        </div>
      )}

      <style>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
};

export default Toast;
