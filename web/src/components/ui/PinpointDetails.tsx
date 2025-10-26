import React, { useState, useEffect } from 'react';
import type { Pinpoint, PostType } from '../../types';
import type { PostPhoto } from '../../types/pinpoint';
import { compressImage, validateImageFile } from '../../utils/imageUtils';

interface PinpointDetailsProps {
  pinpoint: Pinpoint;
  onClose: () => void;
  onAddPost: (pinpointId: string, postData: { type: PostType; text: string; photos?: PostPhoto[] }) => Promise<boolean>;
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

const getPostTypeText = (type: PostType): string => {
  switch (type) {
    case 'alert': return 'Alerta';
    case 'cleaning': return 'Limpo';
    case 'both': return 'Alerta e Limpeza';
    default: return type;
  }
};

export const PinpointDetails: React.FC<PinpointDetailsProps> = ({
  pinpoint,
  onClose,
  onAddPost,
  onDelete
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newPost, setNewPost] = useState({
    type: 'alert' as PostType,
    text: '',
    photos: [] as PostPhoto[]
  });
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isAddingPhoto, setIsAddingPhoto] = useState(false);
  const [photoInputMethod, setPhotoInputMethod] = useState<'file' | 'url'>('file');
  const [photoUrl, setPhotoUrl] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<{ url: string; index: number; photos: PostPhoto[] } | null>(null);

  // Check if cleaning posts are allowed
  const hasAlertOrBoth = pinpoint.posts?.some(post => 
    post.type === 'alert' || post.type === 'both'
  ) || false;

  const handlePostTypeChange = (newType: PostType) => {
    // If trying to select cleaning but no alert/both posts exist, keep current type or switch to alert
    if (newType === 'cleaning' && !hasAlertOrBoth) {
      return; // Don't change the type
    }
    
    // Clear photos if switching between different photo requirements
    const currentRequiredPhotos = newPost.type === 'both' ? 2 : 1;
    const newRequiredPhotos = newType === 'both' ? 2 : 1;
    
    if (currentRequiredPhotos !== newRequiredPhotos) {
      setNewPost({ ...newPost, type: newType, photos: [] });
      setPhotoPreview(null);
      setPhotoUrl('');
      setIsAddingPhoto(false);
    } else {
      setNewPost({ ...newPost, type: newType });
    }
  };

  const handleAddPost = async () => {
    if (!newPost.text.trim()) return;
    
    // Validate required photos based on post type
    const requiredPhotos = newPost.type === 'both' ? 2 : 1;
    if (newPost.photos.length !== requiredPhotos) {
      const typeText = newPost.type === 'both' ? 'Ambos' : newPost.type === 'alert' ? 'Alerta' : 'Limpeza';
      alert(`Postagens do tipo ${typeText} requerem exatamente ${requiredPhotos} foto${requiredPhotos > 1 ? 's' : ''}.`);
      return;
    }
    
    setIsSubmitting(true);
    try {
      const success = await onAddPost(pinpoint.id, newPost);
      if (success) {
        setNewPost({ type: 'alert', text: '', photos: [] });
        setPhotoPreview(null);
        setPhotoUrl('');
        setIsAddingPhoto(false);
        setShowAddForm(false);
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Falha ao adicionar postagem. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
        alert('Falha ao processar imagem. Tente uma imagem diferente.');
      });
  };

  const handleAddPhoto = () => {
    const maxPhotos = newPost.type === 'both' ? 2 : 1;
    
    if (newPost.photos.length >= maxPhotos) {
      alert(`Você só pode adicionar ${maxPhotos} foto${maxPhotos > 1 ? 's' : ''} para postagens do tipo ${newPost.type}.`);
      return;
    }

    if (photoInputMethod === 'url' && photoUrl.trim()) {
      setNewPost(prev => ({
        ...prev,
        photos: [...prev.photos, { url: photoUrl.trim(), isBefore: false }]
      }));
      setPhotoUrl('');
      setIsAddingPhoto(false);
    } else if (photoInputMethod === 'file' && photoPreview) {
      setNewPost(prev => ({
        ...prev,
        photos: [...prev.photos, { url: photoPreview, isBefore: false }]
      }));
      setPhotoPreview(null);
      setIsAddingPhoto(false);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setNewPost(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const handleDelete = async () => {
    if (window.confirm('Tem certeza que deseja excluir este ponto?')) {
      const success = await onDelete(pinpoint.id);
      if (success) {
        onClose();
      }
    }
  };

  // Keyboard navigation for photo modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedPhoto) return;
      
      if (e.key === 'Escape') {
        setSelectedPhoto(null);
      } else if (e.key === 'ArrowLeft' && selectedPhoto.photos.length > 1) {
        const newIndex = selectedPhoto.index > 0 ? selectedPhoto.index - 1 : selectedPhoto.photos.length - 1;
        setSelectedPhoto({
          ...selectedPhoto,
          index: newIndex,
          url: selectedPhoto.photos[newIndex].url
        });
      } else if (e.key === 'ArrowRight' && selectedPhoto.photos.length > 1) {
        const newIndex = selectedPhoto.index < selectedPhoto.photos.length - 1 ? selectedPhoto.index + 1 : 0;
        setSelectedPhoto({
          ...selectedPhoto,
          index: newIndex,
          url: selectedPhoto.photos[newIndex].url
        });
      }
    };

    if (selectedPhoto) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedPhoto]);

  return (
    <div className="pinpoint-details">
      <div className="pinpoint-header">
        <div className="pinpoint-info">
          <h3>📍 Detalhes do Ponto</h3>
          <p className="pinpoint-coords">
            {pinpoint.latitude.toFixed(6)}, {pinpoint.longitude.toFixed(6)}
          </p>
          <p className="pinpoint-date">
            Criado: {new Date(pinpoint.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="pinpoint-actions">
          <button className="delete-btn" onClick={handleDelete} title="Excluir ponto">
            🗑️
          </button>
          <button className="close-btn" onClick={onClose} title="Fechar">
            ✕
          </button>
        </div>
      </div>

      <div className="posts-section">
        <div className="posts-header">
          <h4>Postagens ({pinpoint.posts?.length || 0})</h4>
          <button 
            className="add-post-btn"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? 'Cancelar' : '+ Adicionar Postagem'}
          </button>
        </div>

        {showAddForm && (
          <div className="add-post-form">
            <select 
              value={newPost.type}
              onChange={(e) => handlePostTypeChange(e.target.value as PostType)}
            >
              <option value="alert">⚠️ Alerta</option>
              {(() => {
                return hasAlertOrBoth ? (
                  <option value="cleaning">🧹 Limpeza</option>
                ) : (
                  <option value="cleaning" disabled>🧹 Limpeza (requer alerta primeiro)</option>
                );
              })()}
              <option value="both">🔄 Ambos</option>
            </select>
            {newPost.type === 'cleaning' && !hasAlertOrBoth && (
              <div className="form-warning">
                ⚠️ Você deve criar uma postagem de alerta primeiro antes de adicionar uma postagem de limpeza.
              </div>
            )}
            <input
              type="text"
              placeholder="Post content..."
              value={newPost.text}
              onChange={(e) => setNewPost({ ...newPost, text: e.target.value })}
            />
            {/* Photos section */}
            <div className="form-group">
              <label>
                Fotos (obrigatório) - {newPost.type === 'both' ? '2 fotos necessárias' : '1 foto necessária'}
              </label>
              <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
                {newPost.type === 'both' 
                  ? 'Envie 2 fotos: uma mostrando o problema, outra mostrando após a limpeza'
                  : newPost.type === 'alert'
                  ? 'Envie 1 foto mostrando o problema ambiental'
                  : 'Envie 1 foto mostrando a área após a limpeza'
                }
                {newPost.photos.length > 0 && (
                  <span style={{ 
                    color: newPost.photos.length === (newPost.type === 'both' ? 2 : 1) ? '#22c55e' : '#f59e0b',
                    fontWeight: 500,
                    marginLeft: 8
                  }}>
                    ({newPost.photos.length}/{newPost.type === 'both' ? 2 : 1})
                  </span>
                )}
              </div>
              {newPost.photos.length > 0 && (
                <div className="photo-thumbs" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                  {newPost.photos.map((p, idx) => (
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
              {!isAddingPhoto && newPost.photos.length < (newPost.type === 'both' ? 2 : 1) && (
                <button
                  type="button"
                  className="add-photo-trigger"
                  onClick={() => setIsAddingPhoto(true)}
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1e3a8a 100%)',
                    color: 'white', border: 'none', padding: '8px 14px', borderRadius: 8,
                    cursor: 'pointer', fontSize: 14, fontWeight: 500
                  }}
                >+ Adicionar Foto</button>
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
                className="save-btn"
                onClick={handleAddPost}
                disabled={isSubmitting || !newPost.text.trim() || 
                  (newPost.type === 'both' && newPost.photos.length !== 2) ||
                  ((newPost.type === 'alert' || newPost.type === 'cleaning') && newPost.photos.length !== 1)
                }
              >
                {isSubmitting ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="loading-spinner"></span>
                    Salvando...
                  </span>
                ) : (
                  'Salvar Postagem'
                )}
              </button>
            </div>
          </div>
        )}

        <div className="posts-list">
          {!pinpoint.posts || pinpoint.posts.length === 0 ? (
            <p className="no-posts">Nenhuma postagem ainda. Adicione a primeira!</p>
          ) : (
            pinpoint.posts.map((post) => {
              const photoClass = post.photos && post.photos.length === 1 ? 'single-photo' : 'dual-photos';
              
              return (
              <div key={post.id} className="post-item">
                {/* Photos at the top, full width */}
                {post.photos && post.photos.length > 0 && (
                  <div className={`post-photos ${photoClass}`}>
                    {post.photos.map((photo, idx) => (
                      <div key={photo.id || idx} className="post-photo">
                        <img
                          src={photo.url}
                          alt={`Post photo ${idx + 1}`}
                          onClick={() => setSelectedPhoto({ url: photo.url, index: idx, photos: post.photos })}
                        />
                        {post.photos.length > 1 && (
                          <div className="photo-counter">
                            {idx + 1}/{post.photos.length}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Post content below photos */}
                <div className="post-content">
                  <div className="post-header">
                    <span 
                      className="post-type"
                      style={{ color: getPostTypeColor(post.type) }}
                    >
                      {getPostTypeIcon(post.type)} {getPostTypeText(post.type)}
                    </span>
                    <span className="post-date">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="post-text">{post.text}</p>
                </div>
              </div>
              );
            })
          )}
        </div>
      </div>

      {/* Photo Modal */}
      {selectedPhoto && (
        <div 
          className="photo-modal-overlay" 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20
          }}
          onClick={() => setSelectedPhoto(null)}
        >
          <div 
            className="photo-modal-content"
            style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedPhoto(null)}
              style={{
                position: 'absolute',
                top: -40,
                right: 0,
                background: 'rgba(255, 255, 255, 0.9)',
                border: 'none',
                borderRadius: '50%',
                width: 32,
                height: 32,
                cursor: 'pointer',
                fontSize: 18,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1001
              }}
              title="Close"
            >×</button>

            {/* Navigation arrows */}
            {selectedPhoto.photos.length > 1 && (
              <>
                <button
                  onClick={() => {
                    const newIndex = selectedPhoto.index > 0 ? selectedPhoto.index - 1 : selectedPhoto.photos.length - 1;
                    setSelectedPhoto({
                      ...selectedPhoto,
                      index: newIndex,
                      url: selectedPhoto.photos[newIndex].url
                    });
                  }}
                  style={{
                    position: 'absolute',
                    left: -50,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(255, 255, 255, 0.9)',
                    border: 'none',
                    borderRadius: '50%',
                    width: 40,
                    height: 40,
                    cursor: 'pointer',
                    fontSize: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="Previous photo"
                >‹</button>

                <button
                  onClick={() => {
                    const newIndex = selectedPhoto.index < selectedPhoto.photos.length - 1 ? selectedPhoto.index + 1 : 0;
                    setSelectedPhoto({
                      ...selectedPhoto,
                      index: newIndex,
                      url: selectedPhoto.photos[newIndex].url
                    });
                  }}
                  style={{
                    position: 'absolute',
                    right: -50,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(255, 255, 255, 0.9)',
                    border: 'none',
                    borderRadius: '50%',
                    width: 40,
                    height: 40,
                    cursor: 'pointer',
                    fontSize: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="Next photo"
                >›</button>
              </>
            )}

            {/* Main image */}
            <img
              src={selectedPhoto.url}
              alt={`Photo ${selectedPhoto.index + 1} of ${selectedPhoto.photos.length}`}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                borderRadius: 8,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
              }}
            />

            {/* Photo counter */}
            {selectedPhoto.photos.length > 1 && (
              <div
                style={{
                  position: 'absolute',
                  bottom: -35,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'rgba(255, 255, 255, 0.9)',
                  padding: '4px 8px',
                  borderRadius: 4,
                  fontSize: 12,
                  color: '#333'
                }}
              >
                {selectedPhoto.index + 1} of {selectedPhoto.photos.length}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};