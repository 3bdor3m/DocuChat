import React from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

// تعريف الأنواع لخصائص المكون (Props)
interface PopupMessageProps {
  /** حالة عرض النافذة (true لعرضها، false لإخفائها) */
  isOpen: boolean;
  /** الدالة التي يتم استدعاؤها عند إغلاق النافذة */
  onClose: () => void;
  /** العنوان الرئيسي للرسالة */
  title: string;
  /** نص الرسالة التفصيلي */
  message: string;
  /** نوع الرسالة لتحديد اللون والأيقونة */
  type?: 'success' | 'error' | 'info';
  /** نص زر الإغلاق (اختياري، القيمة الافتراضية 'حسناً') */
  buttonText?: string;
}

const PopupMessage: React.FC<PopupMessageProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  type = 'info',
  buttonText = 'حسناً'
}) => {
  // لا تعرض المكون إذا كانت حالة الفتح (isOpen) هي false
  if (!isOpen) return null;

  // تحديد الألوان والأيقونة بناءً على النوع (Type)
  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle className="w-12 h-12 text-green-500 mb-4" />,
          button: 'bg-green-600 hover:bg-green-700'
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-12 h-12 text-red-500 mb-4" />,
          button: 'bg-red-600 hover:bg-red-700'
        };
      default: // 'info'
        return {
          icon: <Info className="w-12 h-12 text-blue-500 mb-4" />,
          button: 'bg-blue-600 hover:bg-blue-700'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    // 1. الخلفية المعتمة والضبابية (Backdrop)
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      // إغلاق النافذة عند الضغط خارج الصندوق
      onClick={onClose} 
    >
      
      {/* 2. صندوق الرسالة الرئيسي (Modal Content) */}
      <div 
        className="bg-gray-900 border border-gray-800 rounded-2xl p-8 max-w-sm w-full shadow-2xl relative text-center"
        // منع الإغلاق عند الضغط داخل الصندوق
        onClick={(e) => e.stopPropagation()} 
      >
        
        {/* زر الإغلاق العلوي (X) */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-1"
          aria-label="إغلاق النافذة المنبثقة"
        >
          <X className="w-5 h-5" />
        </button>

        {/* المحتوى المركزي للرسالة */}
        <div className="flex flex-col items-center">
          
          {styles.icon} {/* الأيقونة الخاصة بنوع الرسالة */}
          
          <h3 className="text-xl font-bold text-white mb-2">
            {title}
          </h3>
          
          <p className="text-gray-400 mb-6 text-sm leading-relaxed">
            {message}
          </p>

          {/* زر 'حسناً' للتأكيد والإغلاق */}
          <button
            onClick={onClose}
            className={`w-full py-2.5 px-4 rounded-xl text-white font-medium transition-all duration-200 transform hover:scale-[1.02] ${styles.button}`}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PopupMessage;