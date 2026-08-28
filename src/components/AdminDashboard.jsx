import React, { useRef, useState, useCallback } from 'react';
import { useMedia } from '../context/MediaContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { Upload, Trash2, LogOut, MonitorPlay, GripVertical, ImagePlus, Loader2, UserPlus, X, KeyRound, ChevronUp } from 'lucide-react';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors 
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  rectSortingStrategy 
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { storage } from '../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import toast from 'react-hot-toast';

const SortableMediaCard = ({ media, onRemove }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: media.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="media-card">
      {media.type === 'video' ? (
        <video src={media.url} />
      ) : (
        <img src={media.url} alt="media" />
      )}
      
      <div className="media-card-actions">
        <button 
          className="btn btn-ghost" 
          style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', cursor: 'grab' }}
          {...attributes} 
          {...listeners}
          title="Arrastrar para ordenar"
        >
          <GripVertical size={24} />
        </button>
        <button 
          className="btn btn-ghost" 
          style={{ background: 'rgba(236, 72, 153, 0.2)', color: '#ec4899', border: 'none', marginLeft: '0.5rem' }}
          onClick={(e) => { e.stopPropagation(); onRemove(media.id); }}
          title="Eliminar"
        >
          <Trash2 size={24} />
        </button>
      </div>
    </div>
  );
};

const CreateUserModal = ({ onClose, onRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    const result = await onRegister(email, password, displayName);
    if (result.success) {
      setMessage('Usuario creado exitosamente');
      setEmail('');
      setPassword('');
      setDisplayName('');
      setTimeout(onClose, 2000);
    } else {
      setMessage(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="login-container" style={{ zIndex: 200 }}>
      <div className="glass-panel login-box animate-slide-up" style={{ background: 'var(--bg-card)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Crear Nuevo Usuario</h2>
          <button className="btn btn-ghost" onClick={onClose} style={{ padding: '5px' }}>
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          <input 
            type="text" 
            className="input-field" 
            placeholder="Nombre completo" 
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
          />
          <input 
            type="email" 
            className="input-field" 
            placeholder="Correo electrónico" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input 
            type="password" 
            className="input-field" 
            placeholder="Contraseña" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />

          {message && <p style={{ color: message.includes('exitosamente') ? 'var(--primary)' : '#ef4444', fontSize: '0.9rem' }}>{message}</p>}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creando...' : 'Confirmar Creación'}
          </button>
        </form>
      </div>
    </div>
  );
};

const ChangePasswordModal = ({ onClose, onChangePassword }) => {
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    const result = await onChangePassword(newPassword);
    if (result.success) {
      setMessage('Contraseña actualizada');
      setNewPassword('');
      setTimeout(onClose, 2000);
    } else {
      // Si Firebase requiere relogueo por seguridad (auth/requires-recent-login)
      if (result.error.includes('requires-recent-login')) {
        setMessage('Por seguridad, cierra sesión y vuelve a entrar antes de cambiar tu contraseña.');
      } else {
        setMessage(result.error);
      }
    }
    setLoading(false);
  };

  return (
    <div className="login-container" style={{ zIndex: 200 }}>
      <div className="glass-panel login-box animate-slide-up" style={{ background: 'var(--bg-card)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Cambiar Contraseña</h2>
          <button className="btn btn-ghost" onClick={onClose} style={{ padding: '5px' }}>
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          <input 
            type="password" 
            className="input-field" 
            placeholder="Nueva contraseña" 
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={6}
          />

          {message && <p style={{ color: message.includes('actualizada') ? 'var(--primary)' : '#ef4444', fontSize: '0.9rem' }}>{message}</p>}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const { mediaItems, addMediaToDB, removeMedia, user, logout, reorderMedia, register, changeUserPassword } = useMedia();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  if (!user) {
    return <Navigate to="/admin" />;
  }

  const uploadFileToFirebase = async (file) => {
    setUploading(true);
    const isVideo = file.type.startsWith('video/');
    const type = isVideo ? 'video' : 'image';
    const fileName = `${Date.now()}_${file.name}`;
    const storageRef = ref(storage, `media/${fileName}`);

    const uploadTask = uploadBytesResumable(storageRef, file);
    
    // We can show a loading toast if needed, but we already have the UI progress
    
    uploadTask.on('state_changed', 
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(Math.round(progress));
      }, 
      (error) => {
        console.error("Upload failed", error);
        toast.error(`Error al subir ${type === 'video' ? 'el video' : 'la imagen'}`);
        setUploading(false);
      }, 
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        await addMediaToDB(downloadURL, type, fileName);
        toast.success(`¡${type === 'video' ? 'Video' : 'Imagen'} subid${type === 'video' ? 'o' : 'a'} exitosamente!`, {
          icon: '🎉',
          duration: 3000
        });
        setUploading(false);
        setUploadProgress(0);
      }
    );
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach(file => {
        uploadFileToFirebase(file);
      });
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const onDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      Array.from(files).forEach(file => {
        if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
          uploadFileToFirebase(file);
        }
      });
    }
  }, []);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (active && over && active.id !== over.id) {
      const oldIndex = mediaItems.findIndex((item) => item.id === active.id);
      const newIndex = mediaItems.findIndex((item) => item.id === over.id);
      reorderMedia(oldIndex, newIndex);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Admin';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="admin-layout admin-theme animate-fade-in">
      {showCreateUser && (
        <CreateUserModal onClose={() => setShowCreateUser(false)} onRegister={register} />
      )}
      {showChangePassword && (
        <ChangePasswordModal onClose={() => setShowChangePassword(false)} onChangePassword={changeUserPassword} />
      )}

      <aside className="sidebar">
        <div>
          <h2 style={{ color: 'var(--primary)', marginBottom: '0.2rem' }}>
            Hola, {displayName}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Panel de administración de TV</p>
        </div>
        
        <button 
          className="btn btn-primary" 
          onClick={() => fileInputRef.current?.click()}
          style={{ width: '100%' }}
          disabled={uploading}
        >
          <Upload size={20} />
          Subir Archivos
        </button>
        <input 
          type="file" 
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
          accept="image/*,video/*"
          multiple
        />

        <button 
          className="btn btn-ghost" 
          onClick={() => setShowCreateUser(true)}
          style={{ width: '100%', justifyContent: 'flex-start' }}
        >
          <UserPlus size={20} />
          Crear Usuario
        </button>

        <button 
          className="btn btn-ghost" 
          onClick={() => navigate('/')}
          style={{ width: '100%', justifyContent: 'flex-start' }}
        >
          <MonitorPlay size={20} />
          Ver TV Stream
        </button>

        <div className="profile-section" ref={dropdownRef} onClick={() => setDropdownOpen(!dropdownOpen)}>
          <div className="profile-avatar">{initial}</div>
          <div className="profile-info">
            <div className="profile-name">{displayName}</div>
            <div className="profile-role">Administrador</div>
          </div>
          <ChevronUp size={20} style={{ color: 'var(--text-muted)', transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          
          <div className={`profile-dropdown ${dropdownOpen ? 'show' : ''}`}>
            <button 
              className="dropdown-item"
              onClick={(e) => {
                e.stopPropagation();
                setDropdownOpen(false);
                setShowChangePassword(true);
              }}
            >
              <KeyRound size={18} />
              Cambiar Contraseña
            </button>
            <button 
              className="dropdown-item danger"
              onClick={(e) => {
                e.stopPropagation();
                handleLogout();
              }}
            >
              <LogOut size={18} />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </aside>

      <main className="dashboard-content">
        <h2>Contenido Multimedia ({mediaItems.length})</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Administra las imágenes y videos. Arrastra archivos aquí para subirlos, y arrastra las tarjetas para reordenar la cola de visualización.
        </p>

        <div 
          className={`dropzone ${isDragOver ? 'drag-active' : ''}`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
          style={{ pointerEvents: uploading ? 'none' : 'auto', opacity: uploading ? 0.7 : 1 }}
        >
          {uploading ? (
            <div key="uploading-state" style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}>
              <h3 style={{ color: 'var(--text-main)', marginBottom: '1rem' }}><span>Subiendo archivo...</span></h3>
              
              {/* Barra de progreso visual */}
              <div style={{ width: '100%', height: '10px', background: 'rgba(0,0,0,0.1)', borderRadius: '10px', overflow: 'hidden', marginBottom: '1rem' }}>
                <div style={{ 
                  width: `${uploadProgress}%`, 
                  height: '100%', 
                  background: 'linear-gradient(90deg, var(--primary), var(--secondary))', 
                  transition: 'width 0.2s ease',
                  borderRadius: '10px'
                }}></div>
              </div>
              
              <p style={{ color: 'var(--text-muted)' }}><span>Por favor espera a que finalice la subida</span></p>
            </div>
          ) : (
            <div key="idle-state">
              <ImagePlus size={48} style={{ color: isDragOver ? 'var(--primary)' : 'var(--text-muted)', margin: '0 auto 1rem auto' }} />
              <h3 style={{ color: 'var(--text-main)' }}><span>Arrastra fotos y videos aquí</span></h3>
              <p style={{ color: 'var(--text-muted)' }}><span>O haz clic para seleccionar archivos desde tu computadora</span></p>
            </div>
          )}
        </div>

        <div className="media-grid">
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={mediaItems.map(item => item.id)}
              strategy={rectSortingStrategy}
            >
              {mediaItems.map((media) => (
                <SortableMediaCard key={media.id} media={media} onRemove={removeMedia} />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
