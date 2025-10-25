import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { AuthModal } from './AuthModal';
import type { PostType, PostPhoto } from '../../types/pinpoint';
import { compressImage, validateImageFile } from '../../utils/imageUtils';

interface CreatePinpointFormProps {
  latitude: number;
  longitude: number;
  onSubmit: (postData: { type: PostType; text: string; photos: PostPhoto[] }) => void;
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
    text: '',
    photos: [] as PostPhoto[]
  });
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isAddingPhoto, setIsAddingPhoto] = useState(false);
  const [photoInputMethod, setPhotoInputMethod] = useState<'file' | 'url'>('file');
  const [photoUrl, setPhotoUrl] = useState('');

  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const validationError = validateImageFile(file);
    if (validationError) {
      alert(validationError);
      return;
    }

    // Compress and preview
    compressImage(file, { maxSizeKB: 400 })
      .then(compressedDataUrl => {
        setPhotoPreview(compressedDataUrl);
      })
      .catch(error => {
        console.error('Image compression failed:', error);
        alert('Failed to process image. Please try a different image.');
      });
  };

  const handleAddPhoto = () => {
    const maxPhotos = postData.type === 'both' ? 2 : 1;
    
    if (postData.photos.length >= maxPhotos) {
      alert(`You can only add ${maxPhotos} photo${maxPhotos > 1 ? 's' : ''} for ${postData.type} posts.`);
      return;
    }

    if (photoInputMethod === 'url' && photoUrl.trim()) {
      setPostData(prev => ({
        ...prev,
        photos: [...prev.photos, { url: photoUrl.trim(), isBefore: false }]
      }));
      setPhotoUrl('');
      setIsAddingPhoto(false);
    } else if (photoInputMethod === 'file' && photoPreview) {
      setPostData(prev => ({
        ...prev,
        photos: [...prev.photos, { url: photoPreview, isBefore: false }]
      }));
      setPhotoPreview(null);
      setIsAddingPhoto(false);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPostData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const handleTypeChange = (newType: PostType) => {
    // Prevent selection of cleaning for first post
    if (newType === 'cleaning') {
      return; // Don't change the type
    }
    
    // Clear photos if switching between different photo requirements
    const currentRequiredPhotos = postData.type === 'both' ? 2 : 1;
    const newRequiredPhotos = newType === 'both' ? 2 : 1;
    
    if (currentRequiredPhotos !== newRequiredPhotos) {
      setPostData({ ...postData, type: newType, photos: [] });
      setPhotoPreview(null);
      setPhotoUrl('');
      setIsAddingPhoto(false);
    } else {
      setPostData({ ...postData, type: newType });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation: ensure required fields are filled
    if (!postData.text.trim()) return;
    
    // Business rule validation: first post cannot be cleaning
    if (postData.type === 'cleaning') {
      alert('The first post in a pinpoint cannot be a cleaning post. Please select Alert or Both.');
      return;
    }
    
    // Photo validation: require exact number based on type
    const requiredPhotos = postData.type === 'both' ? 2 : 1;
    if (postData.photos.length !== requiredPhotos) {
      const typeText = postData.type === 'both' ? 'Both' : postData.type === 'alert' ? 'Alert' : 'Cleaning';
      alert(`${typeText} posts require exactly ${requiredPhotos} photo${requiredPhotos > 1 ? 's' : ''}.`);
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
            <label htmlFor="post-text">Post Content</label>
            <textarea
              id="post-text"
              placeholder="Enter post content..."
              value={postData.text}
              onChange={(e) => setPostData({ ...postData, text: e.target.value })}
              rows={4}
              required
            />
          </div>

          {/* Photo upload section */}
          <div className="form-group">
            <label>
              Photos (required) - {postData.type === 'both' ? '2 photos needed' : '1 photo needed'}
            </label>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
              {postData.type === 'both' 
                ? 'Upload 2 photos: one showing the issue, one showing it cleaned'
                : postData.type === 'alert'
                ? 'Upload 1 photo showing the environmental issue'
                : 'Upload 1 photo showing the area after cleaning'
              }
              {postData.photos.length > 0 && (
                <span style={{ 
                  color: postData.photos.length === (postData.type === 'both' ? 2 : 1) ? '#22c55e' : '#f59e0b',
                  fontWeight: 500,
                  marginLeft: 8
                }}>
                  ({postData.photos.length}/{postData.type === 'both' ? 2 : 1})
                </span>
              )}
            </div>
            {postData.photos.length > 0 && (
              <div className="photo-thumbs" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                {postData.photos.map((p, idx) => (
                  <div key={idx} style={{ position: 'relative' }}>
                    <img
                      src={p.url}
                      alt={`Post photo ${idx + 1}`}
                      style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 8, border: '1px solid #e2e8f0' }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(idx)}
                      style={{
                        position: 'absolute', top: -6, right: -6, background: '#f56565', color: 'white',
                        border: 'none', width: 22, height: 22, borderRadius: '50%', cursor: 'pointer', fontSize: 12,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                      }}
                      aria-label={`Remove photo ${idx + 1}`}
                    >×</button>
                  </div>
                ))}
              </div>
            )}
            {!isAddingPhoto && postData.photos.length < (postData.type === 'both' ? 2 : 1) && (
              <button
                type="button"
                className="add-photo-trigger"
                onClick={() => setIsAddingPhoto(true)}
                style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1e3a8a 100%)',
                  color: 'white', border: 'none', padding: '8px 14px', borderRadius: 8,
                  cursor: 'pointer', fontSize: 14, fontWeight: 500
                }}
              >+ Add Photo</button>
            )}
            {isAddingPhoto && (
              <div className="photo-uploader" style={{ marginTop: 8 }}>
                {/* Method selector */}
                <div style={{ marginBottom: 8 }}>
                  <button
                    type="button"
                    onClick={() => setPhotoInputMethod('file')}
                    style={{
                      background: photoInputMethod === 'file' ? '#3b82f6' : '#f3f4f6',
                      color: photoInputMethod === 'file' ? 'white' : '#374151',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '6px 0 0 6px',
                      cursor: 'pointer',
                      fontSize: 14
                    }}
                  >Upload File</button>
                  <button
                    type="button"
                    onClick={() => setPhotoInputMethod('url')}
                    style={{
                      background: photoInputMethod === 'url' ? '#3b82f6' : '#f3f4f6',
                      color: photoInputMethod === 'url' ? 'white' : '#374151',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '0 6px 6px 0',
                      cursor: 'pointer',
                      fontSize: 14
                    }}
                  >Photo URL</button>
                </div>

                {photoInputMethod === 'file' ? (
                  <>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoFileChange}
                    />
                    {photoPreview && (
                      <div style={{ marginTop: 8 }}>
                        <img
                          src={photoPreview}
                          alt="Preview"
                          style={{ maxWidth: '100%', maxHeight: 160, borderRadius: 12, border: '1px solid #e2e8f0' }}
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <div>
                    <input
                      type="url"
                      placeholder="Enter image URL (https://...)"
                      value={photoUrl}
                      onChange={(e) => setPhotoUrl(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #e2e8f0',
                        borderRadius: 8,
                        fontSize: 14
                      }}
                    />
                    {photoUrl && (
                      <div style={{ marginTop: 8 }}>
                        <img
                          src={photoUrl}
                          alt="URL Preview"
                          style={{ maxWidth: '100%', maxHeight: 160, borderRadius: 12, border: '1px solid #e2e8f0' }}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling!.textContent = 'Invalid image URL';
                          }}
                        />
                        <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}></div>
                      </div>
                    )}
                  </div>
                )}

                {((photoInputMethod === 'file' && photoPreview) || (photoInputMethod === 'url' && photoUrl.trim())) && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <button
                      type="button"
                      onClick={handleAddPhoto}
                      style={{
                        background: '#10b981', color: 'white', border: 'none', padding: '8px 14px',
                        borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 500
                      }}
                    >Confirm</button>
                    <button
                      type="button"
                      onClick={() => { 
                        setPhotoPreview(null); 
                        setPhotoUrl(''); 
                        setIsAddingPhoto(false); 
                      }}
                      style={{
                        background: '#f56565', color: 'white', border: 'none', padding: '8px 14px',
                        borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 500
                      }}
                    >Cancel</button>
                  </div>
                )}
              </div>
            )}
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
              disabled={!postData.text.trim() || 
                (postData.type === 'both' && postData.photos.length !== 2) ||
                ((postData.type === 'alert' || postData.type === 'cleaning') && postData.photos.length !== 1)
              }
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