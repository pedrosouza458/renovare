import React from 'react';

interface AddPinpointButtonProps {
  isAddingMode: boolean;
  onToggleAddMode: () => void;
}

export const AddPinpointButton: React.FC<AddPinpointButtonProps> = ({ 
  isAddingMode, 
  onToggleAddMode 
}) => {
  return (
    <button 
      className={`add-pinpoint-button ${isAddingMode ? 'active' : ''}`}
      onClick={onToggleAddMode}
      title={isAddingMode ? 'Cancel adding pinpoint' : 'Add new pinpoint'}
    >
      {isAddingMode ? (
        <>
          <span className="button-icon">✕</span>
          <span className="button-text">Cancel</span>
        </>
      ) : (
        <>
          <span className="button-icon">📍</span>
          <span className="button-text">Add Pinpoint</span>
        </>
      )}
    </button>
  );
};