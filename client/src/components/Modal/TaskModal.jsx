import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import { kk } from 'date-fns/locale/kk';
import { FiCalendar, FiX } from 'react-icons/fi';
import 'react-datepicker/dist/react-datepicker.css';
import { registerLocale } from 'react-datepicker';
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from '../../lib/boardConfig';

registerLocale('kk', kk);

const TaskModal = ({
  isOpen,
  onClose,
  onSave,
  task,
  projects,
  users,
  defaultProjectId,
  defaultStatus,
  isSaving
}) => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    projectId: '',
    assignedTo: '',
    priority: 'medium',
    status: 'todo'
  });
  const [dueDate, setDueDate] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (task) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        projectId: task.projectId || task.project?.id || defaultProjectId || '',
        assignedTo: task.assignedTo || task.assignee?.id || '',
        priority: task.priority || 'medium',
        status: task.status || defaultStatus || 'todo'
      });
      setDueDate(task.dueDate ? new Date(task.dueDate) : null);
      return;
    }

    setForm({
      title: '',
      description: '',
      projectId: defaultProjectId || projects[0]?.id || '',
      assignedTo: '',
      priority: 'medium',
      status: defaultStatus || 'todo'
    });
    setDueDate(null);
  }, [defaultProjectId, defaultStatus, isOpen, projects, task, users]);

  if (!isOpen) {
    return null;
  }

  const updateField = (field) => (event) => {
    setForm((current) => ({
      ...current,
      [field]: event.target.value
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    onSave({
      ...form,
      dueDate: dueDate ? dueDate.toISOString() : null
    });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" onClick={(event) => event.stopPropagation()}>
        <div className="modal-topline">
          <div>
            <p className="eyebrow">Тапсырма редакторы</p>
            <h2>{task ? 'Тапсырманы өңдеу' : 'Тапсырма құру'}</h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Тапсырма терезесін жабу">
            <FiX />
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Атауы</span>
            <input
              type="text"
              value={form.title}
              onChange={updateField('title')}
              placeholder="Панельдің бос күйін шығару"
              required
            />
          </label>

          <label className="field">
            <span>Сипаттама</span>
            <textarea
              rows="4"
              value={form.description}
              onChange={updateField('description')}
              placeholder="Мәтінді қысқа әрі әрекетке бағытталған етіп жазыңыз."
            />
          </label>

          <div className="field-grid">
            <label className="field">
              <span>Жоба</span>
              <select value={form.projectId} onChange={updateField('projectId')} required>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Жауапты</span>
              <select value={form.assignedTo} onChange={updateField('assignedTo')}>
                <option value="">Жауапты жоқ</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="field-grid">
            <label className="field">
              <span>Күйі</span>
              <select value={form.status} onChange={updateField('status')}>
                {STATUS_OPTIONS.map((status) => (
                  <option key={status.id} value={status.id}>
                    {status.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Басымдық</span>
              <select value={form.priority} onChange={updateField('priority')}>
                {PRIORITY_OPTIONS.map((priority) => (
                  <option key={priority.id} value={priority.id}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="field">
            <span>Мерзімі</span>
            <div className="date-field">
              <FiCalendar />
              <DatePicker
                selected={dueDate}
                onChange={(date) => setDueDate(date)}
                placeholderText="Күнді таңдаңыз"
                dateFormat="d MMMM yyyy"
                locale="kk"
                className="date-picker-input"
              />
            </div>
          </label>

          <div className="modal-actions">
            <button type="button" className="button button-secondary" onClick={onClose}>
              Бас тарту
            </button>
            <button type="submit" className="button button-primary" disabled={isSaving}>
              {isSaving ? 'Сақталып жатыр...' : task ? 'Тапсырманы сақтау' : 'Тапсырма құру'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
