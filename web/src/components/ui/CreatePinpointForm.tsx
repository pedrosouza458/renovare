import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { AuthModal } from './AuthModal';
import type { PostType } from '../../types/pinpoint';

interface CreatePinpointFormProps {
  latitude: number;
  longitude: number;
  onSubmit: (postData: { type: PostType; title: string; description: string }) => void;
  onCancel: () => void;
}

export const CreatePinpointForm: React.FC<CreatePinpointFormProps> = ({
  latitude,
  longitude,
  onSubmit,
  onCancel
}) => {
  const { user, isAuthenticated } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [postData, setPostData] = useState({
    type: 'alert' as PostType,
    title: '',
    description: ''
  });

  const handleTypeChange = (newType: PostType) => {
    // Prevent selection of cleaning for first post
    if (newType === 'cleaning') {
      return; // Don't change the type
    }
    setPostData({ ...postData, type: newType });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation: ensure required fields are filled
    if (!postData.title.trim() || !postData.description.trim()) return;
    
    // Business rule validation: first post cannot be cleaning
    if (postData.type === 'cleaning') {
      alert('The first post in a pinpoint cannot be a cleaning post. Please select Alert or Both.');
      return;
    }
    
    onSubmit(postData);
  };

  return (
    <div className="create-pinpoint-overlay">
      <div className="create-pinpoint-form">
        <div className="form-header">
          <h3>📍 Create New Pinpoint</h3>
          <button className="close-btn" onClick={onCancel} title="Cancel">
            ✕
          </button>
        </div>

        {/* Authentication encouragement banner */}
        {!isAuthenticated && (
          <div className="auth-banner">
            <div className="auth-banner-content">
              <div className="auth-banner-icon">⭐</div>
              <div className="auth-banner-text">
                <strong>Sign in to earn points!</strong>
                <span>Get rewarded for your environmental contributions</span>
              </div>
              <button 
                type="button"
                className="auth-banner-button"
                onClick={() => setShowAuthModal(true)}
              >
                Sign In
              </button>
            </div>
          </div>
        )}

        {/* User attribution for authenticated users */}
        {isAuthenticated && user && (
          <div className="user-attribution">
            <div className="user-attribution-content">
              <div className="user-attribution-avatar">
                {user.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="user-attribution-text">
                <span>Creating as <strong>{user.username}</strong></span>
                {typeof user.points === 'number' && (
                  <span className="current-points">⭐ {user.points} points</span>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="location-info">
          <p>📍 Location: {latitude.toFixed(6)}, {longitude.toFixed(6)}</p>
          <p className="form-note">A pinpoint must have at least one post</p>
        </div>

        <form onSubmit={handleSubmit} className="post-form">
          <div className="form-group">
            <label htmlFor="post-type">Post Type</label>
            <select 
              id="post-type"
              value={postData.type}
              onChange={(e) => handleTypeChange(e.target.value as PostType)}
              required
            >
              <option value="alert">⚠️ Alert</option>
              <option value="cleaning" disabled>🧹 Cleaning (requires alert first)</option>
              <option value="both">🔄 Both</option>
            </select>
            {postData.type === 'cleaning' && (
              <div className="form-warning">
                ⚠️ Cleaning posts can only be added after creating an alert or both post first.
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="post-title">Post Title</label>
            <input
              id="post-title"
              type="text"
              placeholder="Enter post title..."
              value={postData.title}
              onChange={(e) => setPostData({ ...postData, title: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="post-description">Description</label>
            <textarea
              id="post-description"
              placeholder="Enter post description..."
              value={postData.description}
              onChange={(e) => setPostData({ ...postData, description: e.target.value })}
              rows={3}
              required
            />
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-btn"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="create-btn"
              disabled={!postData.title.trim() || !postData.description.trim()}
            >
              Create Pinpoint
            </button>
          </div>
        </form>
      </div>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode="register"
      />
    </div>
  );
};