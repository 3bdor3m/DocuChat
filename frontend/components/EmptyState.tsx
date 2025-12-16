import React from 'react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionText?: string;
  actionLink?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  actionLink,
  onAction,
  className = '',
}) => {
  return (
    <div className={`text-center py-12 px-4 ${className}`}>
      {icon && (
        <div className="flex justify-center mb-4 text-gray-400 opacity-50">
          {icon}
        </div>
      )}
      
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      
      {description && (
        <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">{description}</p>
      )}
      
      {(actionText && (actionLink || onAction)) && (
        <>
          {actionLink ? (
            <Link
              to={actionLink}
              className="inline-block px-6 py-3 bg-[#2873ec] hover:bg-[#1a5bb8] text-white rounded-xl font-medium transition-all duration-200 shadow-[0_0_20px_rgba(40,115,236,0.3)] hover:shadow-[0_0_30px_rgba(74,143,255,0.5)]"
            >
              {actionText}
            </Link>
          ) : (
            <button
              onClick={onAction}
              className="inline-block px-6 py-3 bg-[#2873ec] hover:bg-[#1a5bb8] text-white rounded-xl font-medium transition-all duration-200 shadow-[0_0_20px_rgba(40,115,236,0.3)] hover:shadow-[0_0_30px_rgba(74,143,255,0.5)]"
            >
              {actionText}
            </button>
          )}
        </>
      )}
    </div>
  );
};
