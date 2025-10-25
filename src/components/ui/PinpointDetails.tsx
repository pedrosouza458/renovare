import React, { useState } from 'react';
import type { Pinpoint, PostType } from '../../types';

interface PinpointDetailsProps {
  pinpoint: Pinpoint;
  onClose: () => void;
  onAddPost: (pinpointId: string, postData: { type: PostType; title: string; description: string }) => Promise<boolean>;
  onDelete: (pinpointId: string) => Promise<boolean>;
}

const getPostTypeIcon = (type: PostType): string => {
  switch (type) {
    case 'alert': return '⚠️';
    case 'cleaning': return '🧹';
    case 'both': return '🔄';
    default: return '📝';
  }
};

const getPostTypeColor = (type: PostType): string => {
  switch (type) {
    case 'alert': return '#ea4335';
    case 'cleaning': return '#34a853';
    case 'both': return '#ff9800';
    default: return '#5f6368';
  }
};

export const PinpointDetails: React.FC<PinpointDetailsProps> = ({
  pinpoint,
  onClose,
  onAddPost,
  onDelete
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPost, setNewPost] = useState({
    type: 'alert' as PostType,
    title: '',
    description: ''
  });

  // Check if cleaning posts are allowed
  const hasAlertOrBoth = pinpoint.posts.some(post => 
    post.type === 'alert' || post.type === 'both'
  );

  const handlePostTypeChange = (newType: PostType) => {
    // If trying to select cleaning but no alert/both posts exist, keep current type or switch to alert
    if (newType === 'cleaning' && !hasAlertOrBoth) {
      return; // Don't change the type
    }
    setNewPost({ ...newPost, type: newType });
  };

  const handleAddPost = async () => {
    if (!newPost.title.trim() || !newPost.description.trim()) return;
    
    try {
      const success = await onAddPost(pinpoint.id, newPost);
      if (success) {
        setNewPost({ type: 'alert', title: '', description: '' });
        setShowAddForm(false);
      }
    } catch (error) {
      // Handle the business rule error from the service
      alert(error instanceof Error ? error.message : 'Failed to add post. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this pinpoint?')) {
      const success = await onDelete(pinpoint.id);
      if (success) {
        onClose();
      }
    }
  };

  return (
    <div className="pinpoint-details">
      <div className="pinpoint-header">
        <div className="pinpoint-info">
          <h3>📍 Pinpoint Details</h3>
          <p className="pinpoint-coords">
            {pinpoint.latitude.toFixed(6)}, {pinpoint.longitude.toFixed(6)}
          </p>
          <p className="pinpoint-date">
            Created: {new Date(pinpoint.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="pinpoint-actions">
          <button className="delete-btn" onClick={handleDelete} title="Delete pinpoint">
            🗑️
          </button>
          <button className="close-btn" onClick={onClose} title="Close">
            ✕
          </button>
        </div>
      </div>

      <div className="posts-section">
        <div className="posts-header">
          <h4>Posts ({pinpoint.posts.length})</h4>
          <button 
            className="add-post-btn"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? 'Cancel' : '+ Add Post'}
          </button>
        </div>

        {showAddForm && (
          <div className="add-post-form">
            <select 
              value={newPost.type}
              onChange={(e) => handlePostTypeChange(e.target.value as PostType)}
            >
              <option value="alert">⚠️ Alert</option>
              {(() => {
                return hasAlertOrBoth ? (
                  <option value="cleaning">🧹 Cleaning</option>
                ) : (
                  <option value="cleaning" disabled>🧹 Cleaning (requires alert first)</option>
                );
              })()}
              <option value="both">🔄 Both</option>
            </select>
            {newPost.type === 'cleaning' && !hasAlertOrBoth && (
              <div className="form-warning">
                ⚠️ You must create an alert post first before adding a cleaning post.
              </div>
            )}
            <input
              type="text"
              placeholder="Post title..."
              value={newPost.title}
              onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
            />
            <textarea
              placeholder="Post description..."
              value={newPost.description}
              onChange={(e) => setNewPost({ ...newPost, description: e.target.value })}
              rows={3}
            />
            <div className="form-actions">
              <button 
                className="save-btn"
                onClick={handleAddPost}
                disabled={!newPost.title.trim() || !newPost.description.trim()}
              >
                Save Post
              </button>
            </div>
          </div>
        )}

        <div className="posts-list">
          {pinpoint.posts.length === 0 ? (
            <p className="no-posts">No posts yet. Add the first one!</p>
          ) : (
            pinpoint.posts.map((post) => (
              <div key={post.id} className="post-item">
                <div className="post-header">
                  <span 
                    className="post-type"
                    style={{ color: getPostTypeColor(post.type) }}
                  >
                    {getPostTypeIcon(post.type)} {post.type}
                  </span>
                  <span className="post-date">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h5 className="post-title">{post.title}</h5>
                <p className="post-description">{post.description}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};