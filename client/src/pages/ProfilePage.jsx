import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiCheckCircle,
  FiKey,
  FiLogOut,
  FiMail,
  FiSave,
  FiShield,
  FiUser
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { getInitials } from '../lib/boardConfig';

const ROLE_LABELS = {
  admin: 'Әкімші',
  user: 'Пайдаланушы'
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const { logout, updateProfile, user } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [feedback, setFeedback] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm((current) => ({
      ...current,
      name: user?.name || '',
      email: user?.email || ''
    }));
  }, [user]);

  const profileStats = useMemo(
    () => [
      {
        icon: <FiMail />,
        label: 'Негізгі email',
        value: user?.email || 'Көрсетілмеген'
      },
      {
        icon: <FiShield />,
        label: 'Рөлі',
        value: ROLE_LABELS[user?.role] || user?.role || 'Пайдаланушы'
      },
      {
        icon: <FiCheckCircle />,
        label: 'Профиль күйі',
        value: 'Аккаунт белсенді және өңдеуге дайын'
      }
    ],
    [user]
  );

  const updateField = (field) => (event) => {
    setForm((current) => ({
      ...current,
      [field]: event.target.value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFeedback(null);

    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      setFeedback({
        type: 'error',
        message: 'Жаңа құпиясөз бен қайталау өрісі бірдей болуы керек.'
      });
      return;
    }

    if (form.currentPassword && !form.newPassword) {
      setFeedback({
        type: 'error',
        message: 'Жаңа құпиясөзді де енгізіңіз немесе екі өрісті де бос қалдырыңыз.'
      });
      return;
    }

    if (form.newPassword && !form.currentPassword) {
      setFeedback({
        type: 'error',
        message: 'Құпиясөзді өзгерту үшін ағымдағы құпиясөзді енгізіңіз.'
      });
      return;
    }

    setSaving(true);

    const result = await updateProfile({
      name: form.name,
      email: form.email,
      currentPassword: form.currentPassword,
      newPassword: form.newPassword
    });

    if (result.success) {
      setFeedback({
        type: 'success',
        message: 'Профиль сәтті жаңартылды.'
      });
      setForm((current) => ({
        ...current,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } else {
      setFeedback({
        type: 'error',
        message: result.message
      });
    }

    setSaving(false);
  };

  return (
    <div className="workspace-shell">
      <div className="workspace-glow workspace-glow-left" />
      <div className="workspace-glow workspace-glow-right" />

      <header className="topbar topbar-profile">
        <div className="brand-mark">
          <div className="brand-mark-icon">PM</div>
          <div>
            <p>Кеңістік</p>
            <strong>Профиль баптауы</strong>
          </div>
        </div>

        <div className="profile-topbar-copy">
          <p className="eyebrow">Профиль</p>
          <strong>Аккаунт мәліметтерін еркін жаңарту аймағы</strong>
          <span>
            Негізгі деректерді, email-ды және қауіпсіздік баптауларын осы беттен кең форматта
            басқарыңыз.
          </span>
        </div>

        <div className="topbar-actions">
          <button type="button" className="button button-secondary" onClick={() => navigate('/')}>
            <FiArrowLeft />
            <span>Тақтаға оралу</span>
          </button>
          <button type="button" className="icon-button" onClick={logout} aria-label="Шығу">
            <FiLogOut />
          </button>
        </div>
      </header>

      {feedback ? <div className={`banner banner-${feedback.type}`}>{feedback.message}</div> : null}

      <section className="profile-page-grid">
        <article className="profile-hero-card">
          <div className="profile-hero-top">
            <div className="profile-avatar-large">{getInitials(user?.name)}</div>
            <span className="profile-summary-badge">
              {ROLE_LABELS[user?.role] || user?.role || 'Пайдаланушы'}
            </span>
          </div>

          <div className="profile-summary-copy">
            <p className="eyebrow">Жеке кабинет</p>
            <h1>{user?.name || 'Пайдаланушы'}</h1>
            <p className="profile-hero-lead">
              Профиль енді кеңірек композицияда көрсетіледі: негізгі ақпарат, қауіпсіздік және
              әрекеттер бір-бірінен анық бөлінген.
            </p>
          </div>

          <div className="profile-hero-meta">
            <div className="profile-hero-meta-item">
              <FiMail />
              <div>
                <span>Email</span>
                <strong>{user?.email || 'Көрсетілмеген'}</strong>
              </div>
            </div>
            <div className="profile-hero-meta-item">
              <FiUser />
              <div>
                <span>Аты-жөні</span>
                <strong>{user?.name || 'Пайдаланушы'}</strong>
              </div>
            </div>
          </div>
        </article>

        <aside className="profile-insight-panel">
          <div className="profile-summary-list">
            {profileStats.map((item) => (
              <div key={item.label} className="profile-summary-item">
                <div className="profile-summary-icon">{item.icon}</div>
                <div>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              </div>
            ))}
          </div>

          <div className="profile-support-card">
            <FiKey />
            <div>
              <strong>Қысқа ескерту</strong>
              <p>
                Егер құпиясөзді өзгертпесеңіз, қауіпсіздік өрістерін бос қалдыруға болады.
              </p>
            </div>
          </div>
        </aside>
      </section>

      <section className="profile-editor-shell">
        <div className="profile-form-header">
          <div>
            <p className="eyebrow">Редакциялау</p>
            <h2>Профильді өңдеу</h2>
          </div>
          <div className="profile-form-status">
            <FiShield />
            <span>Өзгерістер аккаунтыңызға бірден қолданылады</span>
          </div>
        </div>

        <form className="profile-form" onSubmit={handleSubmit}>
          <div className="profile-editor-grid">
            <section className="profile-section-card profile-section-card-featured">
              <div className="profile-section-copy">
                <p className="eyebrow">Негізгі деректер</p>
                <h3>Жеке ақпарат</h3>
                <p>Команда көретін профиль мәліметтерін жаңартыңыз.</p>
              </div>

              <div className="field-grid">
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
              </div>
            </section>

            <section className="profile-section-card">
              <div className="profile-section-copy">
                <p className="eyebrow">Қауіпсіздік</p>
                <h3>Құпиясөзді ауыстыру</h3>
                <p>Құпиясөзді өзгерткіңіз келсе, үш өрісті де толтырыңыз.</p>
              </div>

              <div className="profile-password-note">
                <FiKey />
                <span>Жаңа құпиясөз кемінде 6 таңбадан тұруы керек.</span>
              </div>

              <div className="field-grid">
                <label className="field">
                  <span>Ағымдағы құпиясөз</span>
                  <input
                    type="password"
                    value={form.currentPassword}
                    onChange={updateField('currentPassword')}
                    placeholder="Қазіргі құпиясөзіңіз"
                  />
                </label>

                <label className="field">
                  <span>Жаңа құпиясөз</span>
                  <input
                    type="password"
                    value={form.newPassword}
                    onChange={updateField('newPassword')}
                    placeholder="Кемінде 6 таңба"
                  />
                </label>
              </div>

              <label className="field">
                <span>Жаңа құпиясөзді қайталау</span>
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={updateField('confirmPassword')}
                  placeholder="Жаңа құпиясөзді қайта енгізіңіз"
                />
              </label>
            </section>
          </div>

          <div className="profile-form-actions">
            <button type="button" className="button button-secondary" onClick={() => navigate('/')}>
              Болдырмау
            </button>
            <button type="submit" className="button button-primary" disabled={saving}>
              <FiSave />
              <span>{saving ? 'Сақталып жатыр...' : 'Өзгерістерді сақтау'}</span>
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default ProfilePage;
