import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import {
  FiCalendar,
  FiEdit3,
  FiMoreVertical,
  FiTrash2,
  FiUser
} from 'react-icons/fi';
import { PRIORITY_MAP, formatDate, getInitials } from '../../lib/boardConfig';
import './TaskCard.css';

const TaskCardContent = ({
  isOverlay = false,
  task,
  selected,
  moving,
  isDragging,
  onDelete,
  onEdit,
  onSelect,
  dragHandleProps = {}
}) => {
  const priority = PRIORITY_MAP[task.priority] || PRIORITY_MAP.medium;

  return (
    <article
      className={`task-card ${selected ? 'is-selected' : ''} ${isDragging ? 'is-dragging' : ''} ${moving ? 'is-moving' : ''} ${isOverlay ? 'is-overlay' : ''}`}
      onClick={onSelect}
    >
      <div className="task-card-header">
        <div className="task-card-heading">
          <h4>{task.title}</h4>
          <p>{task.description || 'Әзірге сипаттама жоқ.'}</p>
        </div>

        <div className="task-card-controls">
          {onEdit && onDelete ? (
            <>
              <button
                type="button"
                className="task-handle"
                aria-label="Тапсырманы жылжыту"
                onClick={(event) => event.stopPropagation()}
                {...dragHandleProps}
              >
                <FiMoreVertical />
              </button>
              <button
                type="button"
                className="task-icon-button"
                onClick={(event) => {
                  event.stopPropagation();
                  onEdit();
                }}
                aria-label="Тапсырманы өңдеу"
              >
                <FiEdit3 />
              </button>
              <button
                type="button"
                className="task-icon-button is-danger"
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete();
                }}
                aria-label="Тапсырманы жою"
              >
                <FiTrash2 />
              </button>
            </>
          ) : null}
        </div>
      </div>

      <div className="task-card-meta">
        <span
          className="priority-pill"
          style={{ '--pill-accent': priority.accent, '--pill-surface': priority.surface }}
        >
          {priority.label}
        </span>

        <div className="task-assignee">
          <div className="task-avatar">{getInitials(task.assignee?.name || 'Жауапты жоқ')}</div>
          <span>{task.assignee?.name || 'Жауапты жоқ'}</span>
        </div>
      </div>

      <div className="task-card-footer">
        <div>
          <FiCalendar />
          <span>{formatDate(task.dueDate)}</span>
        </div>
        <div>
          <FiUser />
          <span>{task.creator?.name || 'Сіз құрдыңыз'}</span>
        </div>
      </div>
    </article>
  );
};

const DraggableTaskCard = ({ moving, onDelete, onEdit, onSelect, selected, task }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id
  });

  const style = {
    ...(transform ? { transform: CSS.Translate.toString(transform) } : {})
  };

  return (
    <div ref={setNodeRef} style={style} className={`task-card-shell ${isDragging ? 'is-dragging' : ''}`}>
      <TaskCardContent
        task={task}
        selected={selected}
        moving={moving}
        isDragging={isDragging}
        isOverlay={false}
        onDelete={onDelete}
        onEdit={onEdit}
        onSelect={onSelect}
        dragHandleProps={{
          ...listeners,
          ...attributes
        }}
      />
    </div>
  );
};

const TaskCard = ({ task, selected, moving, onSelect, onEdit, onDelete, isOverlay = false }) => {
  if (!task) {
    return null;
  }

  if (isOverlay) {
    return <TaskCardContent task={task} isDragging isOverlay />;
  }

  return (
    <DraggableTaskCard
      task={task}
      selected={selected}
      moving={moving}
      onSelect={onSelect}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
};

export default TaskCard;
