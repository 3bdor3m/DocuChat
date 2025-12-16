import React from 'react';

interface LoadingSkeletonProps {
  type?: 'card' | 'list' | 'text' | 'circle';
  count?: number;
  className?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  type = 'card',
  count = 1,
  className = '',
}) => {
  const skeletons = Array.from({ length: count }, (_, i) => i);

  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div className={`bg-white/3 backdrop-blur-xl border border-white/10 rounded-3xl p-6 animate-pulse ${className}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/10 rounded-xl"></div>
              <div className="w-16 h-8 bg-white/10 rounded-lg"></div>
            </div>
            <div className="w-24 h-4 bg-white/10 rounded mb-2"></div>
            <div className="w-full h-2 bg-white/10 rounded-full"></div>
          </div>
        );

      case 'list':
        return (
          <div className={`flex items-center gap-3 p-3 bg-black/20 rounded-xl animate-pulse ${className}`}>
            <div className="w-10 h-10 bg-white/10 rounded-lg"></div>
            <div className="flex-1">
              <div className="w-3/4 h-4 bg-white/10 rounded mb-2"></div>
              <div className="w-1/2 h-3 bg-white/10 rounded"></div>
            </div>
          </div>
        );

      case 'text':
        return (
          <div className={`space-y-2 animate-pulse ${className}`}>
            <div className="w-full h-4 bg-white/10 rounded"></div>
            <div className="w-5/6 h-4 bg-white/10 rounded"></div>
            <div className="w-4/6 h-4 bg-white/10 rounded"></div>
          </div>
        );

      case 'circle':
        return (
          <div className={`w-32 h-32 bg-white/10 rounded-full animate-pulse ${className}`}></div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {skeletons.map((_, index) => (
        <div key={index}>{renderSkeleton()}</div>
      ))}
    </>
  );
};
