import React from 'react';
import { FiSearch } from 'react-icons/fi';

const SearchBar = ({ value, onChange, placeholder }) => {
  return (
    <label className="search-field">
      <FiSearch />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
};

export default SearchBar;
