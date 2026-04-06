import React, { useEffect, useState } from 'react';
import { FiCheck, FiUsers, FiX } from 'react-icons/fi';

const ProjectModal = ({
  isOpen,
  onClose,
  onSave,
  project,
  users,
  currentUser,
  isSaving
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [memberIds, setMemberIds] = useState([]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (project) {
      setName(project.name || '');
      setDescription(project.description || '');
      setMemberIds(
        (project.members || [])
          .map((member) => member.id)
          .filter((id) => id && id !== currentUser?.id)
      );
      return;
    }

    setName('');
    setDescription('');
    setMemberIds([]);
  }, [isOpen, project, currentUser]);

  if (!isOpen) {
    return null;
  }

  const toggleMember = (memberId) => {
    setMemberIds((current) =>
      current.includes(memberId)
        ? current.filter((id) => id !== memberId)
        : [...current, memberId]
    );
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave({
      name,
      description,
      memberIds
    });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" onClick={(event) => event.stopPropagation()}>
        <div className="modal-topline">
          <div>
            <p className="eyebrow">Жоба баптауы</p>
            <h2>{project ? 'Жобаны өңдеу' : 'Жоба құру'}</h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Жоба терезесін жабу">
            <FiX />
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Жоба атауы</span>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Өсу науқанының спринті"
              required
            />
          </label>

          <label className="field">
            <span>Сипаттама</span>
            <textarea
              rows="4"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Мақсатты, ауқымды және командадан күтілетін нәтижені жазыңыз."
              required
            />
          </label>

          <div className="field">
            <span>Қатысушылар</span>
            <div className="member-selector">
              <div className="member-chip member-chip-fixed">
                <div className="member-chip-avatar">{currentUser?.name?.slice(0, 1)?.toUpperCase() || 'С'}</div>
                <div>
                  <strong>{currentUser?.name || 'Сіз'}</strong>
                  <p>Иесі</p>
                </div>
                <FiCheck />
              </div>

              {users.length === 0 ? (
                <div className="empty-inline">
                  <FiUsers />
                  <span>Әзірге басқа команда мүшелері табылмады.</span>
                </div>
              ) : (
                users.map((member) => {
                  const selected = memberIds.includes(member.id);

                  return (
                    <button
                      key={member.id}
                      type="button"
                      className={`member-chip ${selected ? 'is-selected' : ''}`}
                      onClick={() => toggleMember(member.id)}
                    >
                      <div className="member-chip-avatar">
                        {member.name?.slice(0, 1)?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <strong>{member.name}</strong>
                        <p>{member.email}</p>
                      </div>
                      {selected ? <FiCheck /> : null}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="button button-secondary" onClick={onClose}>
              Бас тарту
            </button>
            <button type="submit" className="button button-primary" disabled={isSaving}>
              {isSaving ? 'Сақталып жатыр...' : project ? 'Жобаны сақтау' : 'Жоба құру'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectModal;
