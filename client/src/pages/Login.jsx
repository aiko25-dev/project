import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { FiArrowRight, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(email, password);

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
        <div className="auth-badge">Жобаларды басқару жүйесі</div>
        <h1>Жобалар түсінікті. Тапсыру жылдам. Барлығы бір тақтада.</h1>
        <p>
          Жобаларды, тапсырма иелерін, мерзімдерді және жұмыс барысын бір Kanban
          тақтасынан басқарыңыз.
        </p>
        <div className="auth-points">
          <div>
            <FiCheckCircle />
            <span>Ағымдағы жағдайға сай бір негізгі әрекет</span>
          </div>
          <div>
            <FiCheckCircle />
            <span>Күйлерді сүйреп апару және жедел кері байланыс</span>
          </div>
          <div>
            <FiCheckCircle />
            <span>Жоба тізімі, тақта және тапсырма мәліметі бір экранда</span>
          </div>
        </div>
      </div>

      <div className="auth-panel">
        <form className="auth-card" onSubmit={handleSubmit}>
          <div>
            <p className="eyebrow">Қош келдіңіз</p>
            <h2>Кіру</h2>
            <p className="auth-copy">Команда тоқтаған жерден бірден жалғастырыңыз.</p>
          </div>

          {error ? <div className="banner banner-error">{error}</div> : null}

          <label className="field">
            <span>Электрондық пошта</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@company.com"
              required
            />
          </label>

          <label className="field">
            <span>Құпиясөз</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Құпиясөзіңізді енгізіңіз"
              required
            />
          </label>

          <button type="submit" className="button button-primary button-block" disabled={loading}>
            <span>{loading ? 'Кіріп жатыр...' : 'Кіру'}</span>
            <FiArrowRight />
          </button>

          <p className="auth-footer">
            Аккаунтыңыз жоқ па? <Link to="/register">Тіркеліңіз</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
