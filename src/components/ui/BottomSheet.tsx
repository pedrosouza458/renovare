import React from 'react';
import type { WaterwayData } from '../../types';

interface BottomSheetProps {
  waterways: WaterwayData[];
  isOpen: boolean;
  onToggle: () => void;
  onWaterwayClick: (waterway: WaterwayData) => void;
}

const getWaterwayIcon = (type: string): string => {
  switch (type) {
    case 'river': return '🏞️';
    case 'stream': return '🏊';
    default: return '🚣';
  }
};

export const BottomSheet: React.FC<BottomSheetProps> = ({
  waterways,
  isOpen,
  onToggle,
  onWaterwayClick
}) => {
  if (waterways.length === 0) return null;

  return (
    <div className={`bottom-sheet ${isOpen ? 'expanded' : 'collapsed'}`}>
      {/* Handle bar for dragging */}
      <div className="bottom-sheet-handle" onClick={onToggle}>
        <div className="handle-bar"></div>
      </div>
      
      {/* Bottom sheet header */}
      <div className="bottom-sheet-header" onClick={onToggle}>
        <div className="header-content">
          <div className="header-icon">🌊</div>
          <div className="header-text">
            <h3>Waterways nearby</h3>
            <p>{waterways.length} {waterways.length === 1 ? 'result' : 'results'}</p>
          </div>
        </div>
        <div className="expand-icon">
          {isOpen ? '⌄' : '⌃'}
        </div>
      </div>

      {/* Rivers list - Only visible when expanded */}
      {isOpen && (
        <div className="bottom-sheet-content">
          <div className="rivers-list">
            {waterways.map((waterway) => (
              <div
                key={waterway.id}
                className="river-item"
                onClick={() => onWaterwayClick(waterway)}
              >
                <div className="river-info">
                  <div className="river-icon">
                    {getWaterwayIcon(waterway.type)}
                  </div>
                  <div className="river-details">
                    <h4 className="river-name">{waterway.name}</h4>
                    <p className="river-meta">
                      {waterway.type.charAt(0).toUpperCase() + waterway.type.slice(1)} • {waterway.coordinates.length} points
                    </p>
                  </div>
                </div>
                <div className="river-action">
                  <div className="navigate-icon">→</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};