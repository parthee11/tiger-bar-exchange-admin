import React from "react";

/**
 * ItemTypeTag component for displaying item type with appropriate styling
 * 
 * @param {Object} props - Component props
 * @param {string} props.type - Item type (food, drinks, sheesha)
 * @returns {JSX.Element} ItemTypeTag component
 */
export function ItemTypeTag({ type }) {
  const getItemTypeColor = (type) => {
    switch (type) {
      case 'sheesha':
        return 'bg-purple-100 text-purple-800';
      case 'food':
        return 'bg-green-100 text-green-800';
      case 'drinks':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
      getItemTypeColor(type)
    }`}>
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </span>
  );
}