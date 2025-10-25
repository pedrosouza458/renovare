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
      title={isAddingMode ? 'Cancelar adição de ponto' : 'Adicionar novo ponto'}
    >
      {isAddingMode ? (
        <>
          <span className="button-icon">✕</span>
          <span className="button-text">Cancelar</span>
        </>
      ) : (
        <>
          <span className="button-icon">📍</span>
          <span className="button-text">Adicionar Ponto</span>
        </>
      )}
    </button>
  );
};