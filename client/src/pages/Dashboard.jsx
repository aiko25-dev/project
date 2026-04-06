import React, {
  startTransition,
  useDeferredValue,
  useEffect,
  useMemo,
  useState
} from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiEdit3,
  FiFilter,
  FiFolderPlus,
  FiLayers,
  FiLogOut,
  FiPlus,
  FiTrash2,
  FiUser,
  FiUsers
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import KanbanBoard from '../components/Board/KanbanBoard';
import ProjectModal from '../components/Modal/ProjectModal';
import TaskModal from '../components/Modal/TaskModal';
import SearchBar from '../components/Search/SearchBar';
import FilterDropdown from '../components/Filter/FilterDropdown';
import {
  PRIORITY_MAP,
  STATUS_MAP,
  STATUS_OPTIONS,
  formatDate,
  formatProjectStatus,
  getInitials,
  mergeUsers
} from '../lib/boardConfig';

const Dashboard = () => {
  const navigate = useNavigate();
  const { api, logout, user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [directoryUsers, setDirectoryUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [filters, setFilters] = useState({
    query: '',
    status: 'all',
    assignee: 'all',
    priority: 'all'
  });
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [taskDraftDefaults, setTaskDraftDefaults] = useState({
    status: 'todo'
  });
  const [loading, setLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [projectSaving, setProjectSaving] = useState(false);
  const [taskSaving, setTaskSaving] = useState(false);
  const [movingTaskId, setMovingTaskId] = useState(null);
  const [notice, setNotice] = useState(null);

  const deferredQuery = useDeferredValue(filters.query);

  const availableUsers = useMemo(
    () =>
      mergeUsers([
        user,
        ...directoryUsers,
        ...projects.flatMap((project) => [project.creator, ...(project.members || [])])
      ]),
    [directoryUsers, projects, user]
  );

  const activeProject = useMemo(
    () => projects.find((project) => project.id === activeProjectId) || null,
    [activeProjectId, projects]
  );

  const projectMembers = useMemo(
    () => mergeUsers([user, activeProject?.creator, ...(activeProject?.members || [])]),
    [activeProject, user]
  );

  const selectedTask = useMemo(
    () => tasks.find((task) => task.id === selectedTaskId) || null,
    [selectedTaskId, tasks]
  );

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesQuery =
        !deferredQuery ||
        task.title.toLowerCase().includes(deferredQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(deferredQuery.toLowerCase());

      const matchesStatus = filters.status === 'all' || task.status === filters.status;
      const matchesAssignee =
        filters.assignee === 'all' ||
        task.assignedTo === filters.assignee ||
        task.assignee?.id === filters.assignee;
      const matchesPriority = filters.priority === 'all' || task.priority === filters.priority;

      return matchesQuery && matchesStatus && matchesAssignee && matchesPriority;
    });
  }, [deferredQuery, filters.assignee, filters.priority, filters.status, tasks]);

  const boardStats = useMemo(() => {
    return STATUS_OPTIONS.map((status) => ({
      ...status,
      count: tasks.filter((task) => task.status === status.id).length
    }));
  }, [tasks]);

  useEffect(() => {
    const timer = notice ? window.setTimeout(() => setNotice(null), 2600) : null;
    return () => {
      if (timer) {
        window.clearTimeout(timer);
      }
    };
  }, [notice]);

  useEffect(() => {
    const loadProjects = async () => {
      setLoading(true);

      try {
        const [projectsResponse, usersResponse] = await Promise.all([
          api.get('/projects'),
          api.get('/auth/users').catch(() => ({ data: [] }))
        ]);

        const nextProjects = projectsResponse.data || [];
        setProjects(nextProjects);
        setDirectoryUsers(usersResponse.data || []);

        setActiveProjectId((current) => {
          if (current && nextProjects.some((project) => project.id === current)) {
            return current;
          }

          return nextProjects[0]?.id || null;
        });
      } catch (error) {
        setNotice({
          type: 'error',
          message: error.response?.data?.message || 'Жобаларды жүктеу мүмкін болмады.'
        });
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, [api]);

  useEffect(() => {
    const loadTasks = async () => {
      if (!activeProjectId) {
        setTasks([]);
        setSelectedTaskId(null);
        return;
      }

      setTasksLoading(true);

      try {
        const response = await api.get('/tasks', {
          params: {
            projectId: activeProjectId
          }
        });

        setTasks(response.data || []);
        setSelectedTaskId((current) =>
          response.data?.some((task) => task.id === current) ? current : response.data?.[0]?.id || null
        );
      } catch (error) {
        setNotice({
          type: 'error',
          message: error.response?.data?.message || 'Тапсырмаларды жүктеу мүмкін болмады.'
        });
      } finally {
        setTasksLoading(false);
      }
    };

    loadTasks();
  }, [activeProjectId, api]);

  const pushNotice = (type, message) => {
    setNotice({ type, message });
  };

  const openNewProjectModal = () => {
    setEditingProject(null);
    setProjectModalOpen(true);
  };

  const openEditProjectModal = () => {
    if (!activeProject) {
      return;
    }

    setEditingProject(activeProject);
    setProjectModalOpen(true);
  };

  const openTaskModal = (task = null, status = 'todo') => {
    setEditingTask(task);
    setTaskDraftDefaults({
      status: task?.status || status
    });
    setTaskModalOpen(true);
  };

  const handleProjectSelect = (projectId) => {
    startTransition(() => {
      setActiveProjectId(projectId);
      setSelectedTaskId(null);
    });
  };

  const handleProjectSave = async (projectData) => {
    setProjectSaving(true);

    try {
      if (editingProject) {
        const response = await api.put(`/projects/${editingProject.id}`, projectData);

        setProjects((current) =>
          current.map((project) => (project.id === editingProject.id ? response.data : project))
        );
        pushNotice('success', 'Жоба сәтті жаңартылды.');
      } else {
        const response = await api.post('/projects', projectData);

        setProjects((current) => [response.data, ...current]);
        setActiveProjectId(response.data.id);
        pushNotice('success', 'Жоба сәтті құрылды.');
      }

      setProjectModalOpen(false);
      setEditingProject(null);
    } catch (error) {
      pushNotice('error', error.response?.data?.message || 'Жобаны сақтау мүмкін болмады.');
    } finally {
      setProjectSaving(false);
    }
  };

  const handleProjectDelete = async () => {
    if (!activeProject) {
      return;
    }

    const confirmed = window.confirm(
      `"${activeProject.name}" жобасын және оған қатысты барлық тапсырманы жою керек пе?`
    );
    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/projects/${activeProject.id}`);
      const nextProjects = projects.filter((project) => project.id !== activeProject.id);
      setProjects(nextProjects);
      setActiveProjectId(nextProjects[0]?.id || null);

      setTasks([]);
      setSelectedTaskId(null);
      pushNotice('success', 'Жоба сәтті жойылды.');
    } catch (error) {
      pushNotice('error', error.response?.data?.message || 'Жобаны жою мүмкін болмады.');
    }
  };

  const handleTaskSave = async (taskData) => {
    setTaskSaving(true);

    try {
      if (editingTask) {
        const response = await api.put(`/tasks/${editingTask.id}`, taskData);
        setTasks((current) => current.map((task) => (task.id === editingTask.id ? response.data : task)));
        setSelectedTaskId(response.data.id);
        pushNotice('success', 'Тапсырма сәтті жаңартылды.');
      } else {
        const response = await api.post('/tasks', taskData);
        setTasks((current) => [response.data, ...current]);
        setSelectedTaskId(response.data.id);
        pushNotice('success', 'Тапсырма сәтті құрылды.');
      }

      setTaskModalOpen(false);
      setEditingTask(null);
    } catch (error) {
      pushNotice('error', error.response?.data?.message || 'Тапсырманы сақтау мүмкін болмады.');
    } finally {
      setTaskSaving(false);
    }
  };

  const handleTaskDelete = async (taskId) => {
    const task = tasks.find((item) => item.id === taskId);
    const confirmed = window.confirm(`"${task?.title || 'осы тапсырманы'}" жою керек пе?`);

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks((current) => current.filter((item) => item.id !== taskId));

      if (selectedTaskId === taskId) {
        setSelectedTaskId(null);
      }

      pushNotice('success', 'Тапсырма сәтті жойылды.');
    } catch (error) {
      pushNotice('error', error.response?.data?.message || 'Тапсырманы жою мүмкін болмады.');
    }
  };

  const handleTaskMove = async (task, nextStatus) => {
    const previousStatus = task.status;
    setMovingTaskId(task.id);

    setTasks((current) =>
      current.map((item) => (item.id === task.id ? { ...item, status: nextStatus } : item))
    );

    try {
      const response = await api.put(`/tasks/${task.id}`, { status: nextStatus });
      setTasks((current) => current.map((item) => (item.id === task.id ? response.data : item)));
      pushNotice('success', `${task.title} тапсырмасы ${STATUS_MAP[nextStatus].label} күйіне ауыстырылды.`);
    } catch (error) {
      setTasks((current) =>
        current.map((item) => (item.id === task.id ? { ...item, status: previousStatus } : item))
      );
      pushNotice('error', error.response?.data?.message || 'Тапсырманы жылжыту мүмкін болмады.');
    } finally {
      setMovingTaskId(null);
    }
  };

  const resetFilters = () => {
    setFilters({
      query: '',
      status: 'all',
      assignee: 'all',
      priority: 'all'
    });
  };

  const isProjectOwner = activeProject?.createdBy === user?.id || activeProject?.creator?.id === user?.id;

  if (loading) {
    return (
      <div className="workspace-shell">
        <div className="workspace-loading">Жұмыс кеңістігі жүктеліп жатыр...</div>
      </div>
    );
  }

  return (
    <div className="workspace-shell">
      <div className="workspace-glow workspace-glow-left" />
      <div className="workspace-glow workspace-glow-right" />

      <header className="topbar">
        <div className="brand-mark">
          <div className="brand-mark-icon">PM</div>
          <div>
            <p>Кеңістік</p>
            <strong>Жоба орталығы</strong>
          </div>
        </div>

        <div className="topbar-center">
          <label className="project-switcher">
            <span>Жобалар</span>
            <select
              value={activeProjectId || ''}
              onChange={(event) => handleProjectSelect(event.target.value)}
              disabled={!projects.length}
            >
              {projects.length === 0 ? <option value="">Әзірге жобалар жоқ</option> : null}
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </label>

          <SearchBar
            value={filters.query}
            onChange={(query) => setFilters((current) => ({ ...current, query }))}
            placeholder="Тапсырма не сипаттама бойынша іздеу"
          />
        </div>

        <div className="topbar-actions">
          <div className="profile-pill">
            <div className="profile-avatar">{getInitials(user?.name)}</div>
            <div>
              <strong>{user?.name}</strong>
              <p>{user?.email}</p>
            </div>
          </div>
          <button type="button" className="button button-secondary" onClick={() => navigate('/profile')}>
            <FiUser />
            <span>Профиль</span>
          </button>
          <button type="button" className="icon-button" onClick={logout} aria-label="Шығу">
            <FiLogOut />
          </button>
        </div>
      </header>

      {notice ? <div className={`banner banner-${notice.type}`}>{notice.message}</div> : null}

      <div className="dashboard-grid">
        <aside className="sidebar-panel">
          <div className="sidebar-top">
            <div>
              <p className="eyebrow">Жобалар</p>
              <h2>Белсенді жұмыс кеңістіктері</h2>
            </div>
            <button type="button" className="button button-secondary" onClick={openNewProjectModal}>
              <FiFolderPlus />
              <span>Жаңа жоба</span>
            </button>
          </div>

          {projects.length === 0 ? (
            <div className="empty-project-state">
              <div className="empty-project-icon">
                <FiLayers />
              </div>
              <h3>Әзірге жобалар жоқ</h3>
              <p>Тақта, жұмыс барысы және тапсырма мәліметтері ашылуы үшін алғашқы жобаңызды құрыңыз.</p>
              <button type="button" className="button button-primary" onClick={openNewProjectModal}>
                <FiPlus />
                <span>Жоба құру</span>
              </button>
            </div>
          ) : (
            <div className="project-list">
              {projects.map((project) => {
                const isActive = project.id === activeProjectId;
                const participants = mergeUsers([project.creator, ...(project.members || [])]);

                return (
                  <button
                    key={project.id}
                    type="button"
                    className={`project-list-item ${isActive ? 'is-active' : ''}`}
                    onClick={() => handleProjectSelect(project.id)}
                  >
                    <div>
                      <strong>{project.name}</strong>
                      <p>{project.description}</p>
                    </div>
                    <div className="project-list-meta">
                      <span>{participants.length} адам</span>
                      <div className="avatar-stack">
                        {participants.slice(0, 3).map((member) => (
                          <div key={member.id} className="mini-avatar" title={member.name}>
                            {getInitials(member.name)}
                          </div>
                        ))}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </aside>

        <main className="board-panel">
          {activeProject ? (
            <>
              <section className="board-hero">
                <div className="board-hero-copy">
                  <p className="eyebrow">Ағымдағы жоба</p>
                  <h1>{activeProject.name}</h1>
                  <p>{activeProject.description}</p>
                </div>

                <div className="board-hero-actions">
                  <button type="button" className="button button-primary" onClick={() => openTaskModal(null, 'todo')}>
                    <FiPlus />
                    <span>Тапсырма қосу</span>
                  </button>
                  <button type="button" className="button button-secondary" onClick={openEditProjectModal}>
                    <FiEdit3 />
                    <span>Жобаны өңдеу</span>
                  </button>
                  {isProjectOwner ? (
                    <button type="button" className="button button-danger" onClick={handleProjectDelete}>
                      <FiTrash2 />
                      <span>Жою</span>
                    </button>
                  ) : null}
                </div>
              </section>

              <section className="stats-strip">
                {boardStats.map((status) => (
                  <article key={status.id} className="stat-card" style={{ '--accent': status.accent }}>
                    <div>
                      <p>{status.label}</p>
                      <strong>{status.count}</strong>
                    </div>
                    <span>{status.description}</span>
                  </article>
                ))}
              </section>

              <section className="board-toolbar">
                <div className="toolbar-copy">
                  <h3>Жұмыс барысы</h3>
                  <p>Әрекет бір батырмада, күй түспен белгіленген, толық мәлімет оң жақта.</p>
                </div>

                <div className="toolbar-controls">
                  <div className="toolbar-filter-label">
                    <FiFilter />
                    <span>Сүзгілер</span>
                  </div>
                  <FilterDropdown filter={filters} setFilter={setFilters} users={projectMembers} />
                  <button type="button" className="button button-ghost" onClick={resetFilters}>
                    Тазалау
                  </button>
                </div>
              </section>

              {tasksLoading ? (
                <div className="board-loading">Тапсырмалар жүктеліп жатыр...</div>
              ) : (
                <KanbanBoard
                  tasks={filteredTasks}
                  onCreateTask={(status) => openTaskModal(null, status)}
                  onEditTask={(task) => openTaskModal(task, task.status)}
                  onDeleteTask={handleTaskDelete}
                  onMoveTask={handleTaskMove}
                  onSelectTask={(task) => setSelectedTaskId(task.id)}
                  selectedTaskId={selectedTaskId}
                  movingTaskId={movingTaskId}
                />
              )}
            </>
          ) : (
            <section className="board-placeholder">
              <div className="empty-project-icon">
                <FiLayers />
              </div>
              <h2>Жобадан бастаңыз</h2>
              <p>
                Жоба құрылған соң тақтада «Жоспарда», «Орындалып жатыр», «Дайын» және «Тоқтап тұр»
                бағандары сүйреп апару мүмкіндігімен көрінеді.
              </p>
              <button type="button" className="button button-primary" onClick={openNewProjectModal}>
                <FiPlus />
                <span>Жоба құру</span>
              </button>
            </section>
          )}
        </main>

        <aside className="details-panel">
          {selectedTask ? (
            <>
              <div className="details-top">
                <div>
                  <p className="eyebrow">Тапсырма мәліметі</p>
                  <h2>{selectedTask.title}</h2>
                </div>
                <span
                  className="status-pill"
                  style={{
                    '--pill-accent': STATUS_MAP[selectedTask.status]?.accent || '#3B82F6',
                    '--pill-surface':
                      STATUS_MAP[selectedTask.status]?.surface || 'rgba(59, 130, 246, 0.12)'
                  }}
                >
                  {STATUS_MAP[selectedTask.status]?.label || selectedTask.status}
                </span>
              </div>

              <p className="details-description">
                {selectedTask.description || 'Әзірге сипаттама қосылмаған.'}
              </p>

              <div className="detail-list">
                <div className="detail-item">
                  <FiUser />
                  <div>
                    <span>Жауапты</span>
                    <strong>{selectedTask.assignee?.name || user?.name || 'Жауапты жоқ'}</strong>
                  </div>
                </div>
                <div className="detail-item">
                  <FiCalendar />
                  <div>
                    <span>Мерзімі</span>
                    <strong>{formatDate(selectedTask.dueDate)}</strong>
                  </div>
                </div>
                <div className="detail-item">
                  <FiClock />
                  <div>
                    <span>Басымдық</span>
                    <strong>{PRIORITY_MAP[selectedTask.priority]?.label || selectedTask.priority}</strong>
                  </div>
                </div>
                <div className="detail-item">
                  <FiUsers />
                  <div>
                    <span>Жоба</span>
                    <strong>{selectedTask.project?.name || activeProject?.name}</strong>
                  </div>
                </div>
              </div>

              <div className="details-actions">
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => openTaskModal(selectedTask, selectedTask.status)}
                >
                  <FiEdit3 />
                  <span>Өңдеу</span>
                </button>
                <button
                  type="button"
                  className="button button-danger"
                  onClick={() => handleTaskDelete(selectedTask.id)}
                >
                  <FiTrash2 />
                  <span>Жою</span>
                </button>
              </div>
            </>
          ) : activeProject ? (
            <>
              <div className="details-top">
                <div>
                  <p className="eyebrow">Жоба туралы</p>
                  <h2>{activeProject.name}</h2>
                </div>
                <FiCheckCircle className="details-icon" />
              </div>

              <p className="details-description">{activeProject.description}</p>

              <div className="detail-list">
                <div className="detail-item">
                  <FiUsers />
                  <div>
                    <span>Қатысушылар</span>
                    <strong>{projectMembers.length} адам</strong>
                  </div>
                </div>
                <div className="detail-item">
                  <FiLayers />
                  <div>
                    <span>Күйі</span>
                    <strong>{formatProjectStatus(activeProject.status)}</strong>
                  </div>
                </div>
                <div className="detail-item">
                  <FiClock />
                  <div>
                    <span>Көрінетін тапсырмалар</span>
                    <strong>{filteredTasks.length}</strong>
                  </div>
                </div>
              </div>

              <div className="participant-list">
                {projectMembers.map((member) => (
                  <div key={member.id} className="participant-row">
                    <div className="participant-avatar">{getInitials(member.name)}</div>
                    <div>
                      <strong>{member.name}</strong>
                      <p>{member.email || 'Жұмыс кеңістігінің қатысушысы'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="details-empty">
              <FiLayers />
              <h3>Тапсырма мәліметі осы жерде көрсетіледі</h3>
              <p>Иесін, басымдығын және мерзімін көру үшін тақтадан тапсырма карточкасын таңдаңыз.</p>
            </div>
          )}
        </aside>
      </div>

      <ProjectModal
        isOpen={projectModalOpen}
        onClose={() => {
          setProjectModalOpen(false);
          setEditingProject(null);
        }}
        onSave={handleProjectSave}
        project={editingProject}
        users={availableUsers.filter((member) => member.id !== user?.id)}
        currentUser={user}
        isSaving={projectSaving}
      />

      <TaskModal
        isOpen={taskModalOpen}
        onClose={() => {
          setTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleTaskSave}
        task={editingTask}
        projects={projects}
        users={projectMembers}
        defaultProjectId={activeProjectId}
        defaultStatus={taskDraftDefaults.status}
        isSaving={taskSaving}
      />
    </div>
  );
};

export default Dashboard;
