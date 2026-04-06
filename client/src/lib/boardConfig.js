export const STATUS_OPTIONS = [
  {
    id: 'todo',
    label: 'Жоспарда',
    description: 'Бастауға дайын',
    accent: '#F59E0B',
    surface: 'rgba(245, 158, 11, 0.12)',
    emptyMessage: 'Әзірге тапсырма жоқ. Төменнен біреуін қосыңыз.'
  },
  {
    id: 'inProgress',
    label: 'Орындалып жатыр',
    description: 'Қазір орындалып жатыр',
    accent: '#3B82F6',
    surface: 'rgba(59, 130, 246, 0.12)',
    emptyMessage: 'Әзірге орындалып жатқан тапсырма жоқ.'
  },
  {
    id: 'done',
    label: 'Дайын',
    description: 'Аяқталды',
    accent: '#22C55E',
    surface: 'rgba(34, 197, 94, 0.12)',
    emptyMessage: 'Аяқталған жұмыстар осы жерде көрсетіледі.'
  },
  {
    id: 'blocked',
    label: 'Тоқтап тұр',
    description: 'Назар аударуды қажет етеді',
    accent: '#EF4444',
    surface: 'rgba(239, 68, 68, 0.12)',
    emptyMessage: 'Тоқтап тұрған тапсырмалар осы жерде көрсетіледі.'
  }
];

export const PRIORITY_OPTIONS = [
  { id: 'low', label: 'Төмен', accent: '#22C55E', surface: 'rgba(34, 197, 94, 0.12)' },
  { id: 'medium', label: 'Орташа', accent: '#F59E0B', surface: 'rgba(245, 158, 11, 0.12)' },
  { id: 'high', label: 'Жоғары', accent: '#EF4444', surface: 'rgba(239, 68, 68, 0.12)' }
];

export const STATUS_MAP = Object.fromEntries(STATUS_OPTIONS.map((status) => [status.id, status]));
export const PRIORITY_MAP = Object.fromEntries(PRIORITY_OPTIONS.map((priority) => [priority.id, priority]));
export const PROJECT_STATUS_MAP = {
  active: 'Белсенді',
  completed: 'Аяқталған',
  archived: 'Мұрағатталған'
};

export const getInitials = (value = '') =>
  value
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'ЖҚ';

export const formatDate = (value) => {
  if (!value) {
    return 'Мерзімі көрсетілмеген';
  }

  try {
    return new Intl.DateTimeFormat('kk-KZ', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(value));
  } catch (error) {
    return value;
  }
};

export const mergeUsers = (users = []) => {
  const uniqueUsers = new Map();

  users.filter(Boolean).forEach((user) => {
    if (user?.id) {
      uniqueUsers.set(user.id, user);
    }
  });

  return [...uniqueUsers.values()];
};

export const formatProjectStatus = (value) => PROJECT_STATUS_MAP[value] || value;
