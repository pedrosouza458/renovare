import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { AuthModal } from './AuthModal';
import './ProfileButton.css';

interface ProfileButtonProps {
  className?: string;
}

export const ProfileButton: React.FC<ProfileButtonProps> = ({ className = '' }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleClick = () => {
    if (isAuthenticated) {
      setShowDropdown(!showDropdown);
    } else {
      setShowAuthModal(true);
    }
  };

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
  };

  return (
    <div className={`profile-button-container ${className}`}>
      <button 
        className={`profile-button ${isAuthenticated ? 'authenticated' : 'unauthenticated'}`}
        onClick={handleClick}
        aria-label={isAuthenticated ? 'User profile' : 'Login'}
      >
        {isAuthenticated ? (
          <div className="profile-avatar">
            <span className="profile-initial">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
        ) : (
          <div className="login-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path 
                d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
              <path 
                d="M20.59 22C20.59 18.13 16.74 15 12 15C7.26 15 3.41 18.13 3.41 22" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}
      </button>

      {showDropdown && isAuthenticated && (
        <>
          <div 
            className="dropdown-overlay" 
            onClick={() => setShowDropdown(false)}
          />
          <div className="profile-dropdown">
            <div className="dropdown-header">
              <div className="user-info">
                <div className="user-avatar">
                  <span className="user-initial">
                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="user-details">
                  <div className="username">{user?.username}</div>
                  <div className="user-email">{user?.email}</div>
                  {typeof user?.points === 'number' && (
                    <div className="user-points">
                      <span className="points-icon">⭐</span>
                      {user.points} points
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="dropdown-divider"></div>
            <button 
              className="dropdown-item logout-item"
              onClick={handleLogout}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path 
                  d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
                <path 
                  d="M16 17L21 12L16 7" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
                <path 
                  d="M21 12H9" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
              Logout
            </button>
          </div>
        </>
      )}

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode="login"
      />
    </div>
  );
};