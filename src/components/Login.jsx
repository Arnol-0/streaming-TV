import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMedia } from '../context/MediaContext';
import { Lock, User } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useMedia();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(email, password);

    if (result.success) {
      navigate('/admin/dashboard');
    } else {
      setError('Credenciales incorrectas o usuario no encontrado');
    }
    setLoading(false);
  };

  return (
    <div className="login-container admin-theme">
      <div className="glass-panel login-box animate-slide-up">
        <h2>Panel de Control</h2>
        <p className="text-muted" style={{ color: 'var(--text-muted)' }}>
          Ingresa tus credenciales para administrar el TV Stream
        </p>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <User style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={20} />
            <input 
              type="email" 
              className="input-field" 
              placeholder="Correo electrónico" 
              style={{ paddingLeft: '40px' }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div style={{ position: 'relative' }}>
            <Lock style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={20} />
            <input 
              type="password" 
              className="input-field" 
              placeholder="Contraseña" 
              style={{ paddingLeft: '40px' }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p style={{ color: '#ef4444', fontSize: '0.9rem' }}>{error}</p>}

          <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }} disabled={loading}>
            {loading ? 'Cargando...' : 'Iniciar Sesión'}
          </button>

          <div style={{ borderTop: '1px solid var(--glass-border)', margin: '1rem 0' }}></div>

          <button type="button" className="btn btn-ghost" onClick={() => navigate('/')}>
            Volver al TV Stream
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
