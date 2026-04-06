import React, { useMemo } from 'react';
import {
  closestCorners,
  DndContext,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import TaskCard from '../TaskCard/TaskCard';
import { STATUS_OPTIONS } from '../../lib/boardConfig';
import './KanbanBoard.css';

const getColumnDropId = (statusId) => `column-${statusId}`;

const getStatusIdFromDropTarget = (over) => {
  if (!over) {
    return null;
  }

  const statusId = over.data?.current?.statusId;
  if (statusId) {
    return statusId;
  }

  if (typeof over.id === 'string' && over.id.startsWith('column-')) {
    return over.id.replace('column-', '');
  }

  return null;
};

const KanbanColumn = ({
  movingTaskId,
  onCreateTask,
  onDeleteTask,
  onEditTask,
  onSelectTask,
  selectedTaskId,
  status,
  tasks
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id: getColumnDropId(status.id),
    data: {
      statusId: status.id,
      type: 'column'
    }
  });

  return (
    <section className={`kanban-column ${isOver ? 'is-over' : ''}`} style={{ '--column-accent': status.accent, '--column-surface': status.surface }}>
      <header className="kanban-column-header">
        <div>
          <p>{status.label}</p>
          <span>{status.description}</span>
        </div>
        <strong>{tasks.length}</strong>
      </header>

      <div ref={setNodeRef} className="kanban-column-body">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              selected={selectedTaskId === task.id}
              moving={movingTaskId === task.id}
              onSelect={() => onSelectTask(task)}
              onEdit={() => onEditTask(task)}
              onDelete={() => onDeleteTask(task.id)}
            />
          ))
        ) : (
          <div className="kanban-empty-state">
            <p>{status.emptyMessage}</p>
            <button type="button" className="button button-secondary" onClick={() => onCreateTask(status.id)}>
              + Тапсырма қосу
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

const KanbanBoard = ({
  tasks,
  onCreateTask,
  onDeleteTask,
  onEditTask,
  onMoveTask,
  onSelectTask,
  selectedTaskId,
  movingTaskId
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6
      }
    })
  );
  const groupedTasks = useMemo(() => {
    return STATUS_OPTIONS.reduce(
      (columns, status) => ({
        ...columns,
        [status.id]: tasks.filter((task) => task.status === status.id)
      }),
      {}
    );
  }, [tasks]);

  const handleDragEnd = (event) => {
    if (!event.over) {
      return;
    }

    const draggedTask = tasks.find((task) => task.id === event.active.id);
    const nextStatus = getStatusIdFromDropTarget(event.over);

    if (!draggedTask || !nextStatus || draggedTask.status === nextStatus) {
      return;
    }

    onMoveTask(draggedTask, nextStatus);
  };

  return (
    <DndContext
      collisionDetection={closestCorners}
      sensors={sensors}
      onDragEnd={handleDragEnd}
    >
      <div className="kanban-board">
        {STATUS_OPTIONS.map((status) => (
          <KanbanColumn
            key={status.id}
            movingTaskId={movingTaskId}
            onCreateTask={onCreateTask}
            onDeleteTask={onDeleteTask}
            onEditTask={onEditTask}
            onSelectTask={onSelectTask}
            selectedTaskId={selectedTaskId}
            status={status}
            tasks={groupedTasks[status.id] || []}
          />
        ))}
      </div>
    </DndContext>
  );
};

export default KanbanBoard;
