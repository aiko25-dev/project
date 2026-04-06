import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { FiArrowRight, FiLayers } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    const result = await register(form.name, form.email, form.password);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  return (
    <div className="auth-shell">
      <div className="auth-hero">
        <div className="auth-badge">Команда баптауы</div>
        <h1>Командаңыз бірден түсінетін ұқыпты жұмыс кеңістігін ашыңыз.</h1>
        <p>
          Жобалар құрып, жауаптыларды бекітіп, тапсырмаларды күйлер арасында жылжытып,
          аз мәтін мен анық кері байланыс арқылы барлығын бір бағытта ұстаңыз.
        </p>
        <div className="auth-points">
          <div>
            <FiLayers />
            <span>Жобалар, тапсырмалар және процесс бірден байланысады</span>
          </div>
          <div>
            <FiLayers />
            <span>Өңдеу және жою батырмалары бар карточкалық тақта</span>
          </div>
          <div>
            <FiLayers />
            <span>Компьютер мен телефонға бейімделген панель</span>
          </div>
        </div>
      </div>

      <div className="auth-panel">
        <form className="auth-card" onSubmit={handleSubmit}>
          <div>
            <p className="eyebrow">Жұмыс кеңістігіне қолжетімділік ашу</p>
            <h2>Тіркелу</h2>
            <p className="auth-copy">Тіркелгеннен кейін бірден жүйеге кіресіз.</p>
          </div>

          {error ? <div className="banner banner-error">{error}</div> : null}

          <label className="field">
            <span>Толық аты-жөні</span>
            <input
              type="text"
              value={form.name}
              onChange={updateField('name')}
              placeholder="Amina Sadykova"
              required
            />
          </label>

          <label className="field">
            <span>Электрондық пошта</span>
            <input
              type="email"
              value={form.email}
              onChange={updateField('email')}
              placeholder="you@company.com"
              required
            />
          </label>

          <label className="field">
            <span>Құпиясөз</span>
            <input
              type="password"
              value={form.password}
              onChange={updateField('password')}
              placeholder="Кемінде 6 таңба"
              required
            />
          </label>

          <button type="submit" className="button button-primary button-block" disabled={loading}>
            <span>{loading ? 'Аккаунт ашылып жатыр...' : 'Аккаунт ашу'}</span>
            <FiArrowRight />
          </button>

          <p className="auth-footer">
            Тіркеліп қойғансыз ба? <Link to="/login">Кіру</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
