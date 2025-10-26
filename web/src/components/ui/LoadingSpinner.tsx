import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = "Loading...", 
  className = "" 
}) => {
  return (
    <div className={`loading-indicator ${className}`}>
      <div className="loading-spinner"></div>
      <span>{message}</span>
    </div>
  );
};