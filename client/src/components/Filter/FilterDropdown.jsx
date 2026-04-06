import React from 'react';
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from '../../lib/boardConfig';

const FilterDropdown = ({ filter, setFilter, users }) => {
  const updateFilter = (field) => (event) => {
    setFilter((current) => ({
      ...current,
      [field]: event.target.value
    }));
  };

  return (
    <div className="filter-group">
      <label className="filter-select">
        <span>Күйі</span>
        <select value={filter.status} onChange={updateFilter('status')}>
          <option value="all">Барлығы</option>
          {STATUS_OPTIONS.map((status) => (
            <option key={status.id} value={status.id}>
              {status.label}
            </option>
          ))}
        </select>
      </label>

      <label className="filter-select">
        <span>Жауапты</span>
        <select value={filter.assignee} onChange={updateFilter('assignee')}>
          <option value="all">Барлығы</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
      </label>

      <label className="filter-select">
        <span>Басымдық</span>
        <select value={filter.priority} onChange={updateFilter('priority')}>
          <option value="all">Кез келген</option>
          {PRIORITY_OPTIONS.map((priority) => (
            <option key={priority.id} value={priority.id}>
              {priority.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
};

export default FilterDropdown;
