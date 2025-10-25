import React from 'react';
import type { Pinpoint } from '../../types';
import { PinpointDetails } from './PinpointDetails';

interface BottomSheetProps {
  pinpoints: Pinpoint[];
  selectedPinpoint: Pinpoint | null;
  isOpen: boolean;
  onToggle: () => void;
  onPinpointClick: (pinpoint: Pinpoint) => void;
  onClosePinpointDetails: () => void;
  onAddPost: (pinpointId: string, postData: { type: 'alert' | 'cleaning' | 'both'; title: string; description: string }) => Promise<boolean>;
  onDeletePinpoint: (pinpointId: string) => Promise<boolean>;
}

const getPinpointIcon = (pinpoint: Pinpoint): string => {
  if (!pinpoint.posts || pinpoint.posts.length === 0) return '📍';
  
  const hasAlert = pinpoint.posts.some(p => p.type === 'alert' || p.type === 'both');
  const hasCleaning = pinpoint.posts.some(p => p.type === 'cleaning' || p.type === 'both');
  
  if (hasAlert && hasCleaning) return '🔄';
  if (hasAlert) return '⚠️';
  if (hasCleaning) return '🧹';
  return '📍';
};

export const BottomSheet: React.FC<BottomSheetProps> = ({
  pinpoints,
  selectedPinpoint,
  isOpen,
  onToggle,
  onPinpointClick,
  onClosePinpointDetails,
  onAddPost,
  onDeletePinpoint
}) => {
  // If a pinpoint is selected, show its details
  if (selectedPinpoint) {
    return (
      <div className="bottom-sheet expanded">
        <PinpointDetails
          pinpoint={selectedPinpoint}
          onClose={onClosePinpointDetails}
          onAddPost={onAddPost}
          onDelete={onDeletePinpoint}
        />
      </div>
    );
  }

  // Otherwise show the pinpoints list
  if (pinpoints.length === 0) return null;

  return (
    <div className={`bottom-sheet ${isOpen ? 'expanded' : 'collapsed'}`}>
      {/* Handle bar for dragging */}
      <div className="bottom-sheet-handle" onClick={onToggle}>
        <div className="handle-bar"></div>
      </div>
      
      {/* Bottom sheet header */}
      <div className="bottom-sheet-header" onClick={onToggle}>
        <div className="header-content">
          <div className="header-icon">📍</div>
          <div className="header-text">
            <h3>Pinpoints</h3>
            <p>{pinpoints.length} {pinpoints.length === 1 ? 'pinpoint' : 'pinpoints'}</p>
          </div>
        </div>
        <div className="expand-icon">
          {isOpen ? '⌄' : '⌃'}
        </div>
      </div>

      {/* Pinpoints list - Only visible when expanded */}
      {isOpen && (
        <div className="bottom-sheet-content">
          <div className="rivers-list">
            {pinpoints.map((pinpoint) => (
              <div
                key={pinpoint.id}
                className="river-item"
                onClick={() => onPinpointClick(pinpoint)}
              >
                <div className="river-info">
                  <div className="river-icon">
                    {getPinpointIcon(pinpoint)}
                  </div>
                  <div className="river-details">
                    <h4 className="river-name">
                      {pinpoint.latitude.toFixed(4)}, {pinpoint.longitude.toFixed(4)}
                    </h4>
                    <p className="river-meta">
                      {pinpoint.posts?.length || 0} {(pinpoint.posts?.length || 0) === 1 ? 'post' : 'posts'} • {new Date(pinpoint.createdAt).toLocaleDateString()}
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