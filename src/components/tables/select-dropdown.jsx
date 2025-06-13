import React from 'react';
import { Select, SelectOption } from '../ui/select';

const SelectDropdown = ({ 
  id, 
  label, 
  value, 
  onChange, 
  options, 
  placeholder = "Select an option", 
  disabled = false,
  className = "",
  required = false
}) => {
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium mb-1"
        >
          {label}{required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <Select
        id={id}
        value={value}
        onChange={onChange}
        className={`w-full ${className}`}
        disabled={disabled}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </div>
  );
};

export default SelectDropdown;