import React from 'react';

interface ErrorIndicatorProps {
  message: string;
  className?: string;
}

export const ErrorIndicator: React.FC<ErrorIndicatorProps> = ({ 
  message, 
  className = "" 
}) => {
  return (
    <div className={`error-indicator ${className}`}>
      <span>⚠️ {message}</span>
    </div>
  );
};