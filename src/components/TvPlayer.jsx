import React, { useState, useEffect, useRef } from 'react';
import { useMedia } from '../context/MediaContext';
import { Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FullscreenButton from './FullscreenButton';

const TvPlayer = () => {
  const { mediaItems } = useMedia();
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!mediaItems || mediaItems.length === 0) return;

    const currentMedia = mediaItems[currentIndex];
    let timer;

    if (currentMedia.type === 'image') {
      // Advance to next after duration
      timer = setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % mediaItems.length);
      }, currentMedia.duration || 5000);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [currentIndex, mediaItems]);

  const handleVideoEnded = () => {
    setCurrentIndex((prev) => (prev + 1) % mediaItems.length);
  };

  if (!mediaItems || mediaItems.length === 0) {
    return (
      <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h2>No media available</h2>
        <div className="player-controls">
          <button className="btn btn-ghost" onClick={() => navigate('/admin')}>
            <Settings size={24} />
          </button>
        </div>
      </div>
    );
  }

  const currentMedia = mediaItems[currentIndex];

  return (
    <div className="app-container">
      <div className="media-player">
        {mediaItems.map((media, index) => {
          const isActive = index === currentIndex;
          
          if (media.type === 'video') {
            return (
              <video
                key={media.id}
                ref={isActive ? videoRef : null}
                src={media.url}
                className={`media-layer ${isActive ? 'active' : ''}`}
                autoPlay={isActive}
                muted={true} // Usually better for autoplay policies
                onEnded={isActive ? handleVideoEnded : undefined}
                style={{ zIndex: isActive ? 5 : 1 }}
              />
            );
          } else {
            return (
              <img
                key={media.id}
                src={media.url}
                className={`media-layer animate-fade-in ${isActive ? 'active' : ''}`}
                alt="stream content"
                style={{ zIndex: isActive ? 5 : 1 }}
              />
            );
          }
        })}

        <div className="player-controls">
          <FullscreenButton />
          <button className="btn btn-ghost" onClick={() => navigate('/admin')}>
            <Settings size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TvPlayer;
