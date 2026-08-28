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
    if (mediaItems.length === 0) return;

    const currentMedia = mediaItems[currentIndex];
    
    if (currentMedia?.type === 'image') {
      const timer = setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % mediaItems.length);
      }, 10000); // 10 segundos por imagen
      
      return () => clearTimeout(timer);
    } else if (currentMedia?.type === 'video') {
      // Forzar la reproducción del video
      const playTimer = setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.currentTime = 0;
          videoRef.current.play().catch(e => console.error("Error al reproducir video:", e));
        }
      }, 50); // Pequeño delay para que React monte el ref

      return () => clearTimeout(playTimer);
    }
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
                loop={mediaItems.length === 1}
                onEnded={isActive ? handleVideoEnded : undefined}
                style={{ zIndex: isActive ? 5 : 1 }}
              />
            );
          } else {
            return (
              <img
                key={media.id}
                src={media.url}
                className={`media-layer ${isActive ? 'active' : ''}`}
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
