/**
 * TV Screen Settings utility functions for local storage management
 */

// Local storage key for TV screen category order
const TV_SCREEN_CATEGORY_ORDER_KEY = 'tv_screen_category_order';

/**
 * Get the saved category order from local storage
 * @returns {string[]} Array of category IDs in the saved order, or empty array if none saved
 */
export const getSavedCategoryOrder = () => {
  try {
    const saved = localStorage.getItem(TV_SCREEN_CATEGORY_ORDER_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Error reading category order from local storage:', error);
    return [];
  }
};

/**
 * Save category order to local storage
 * @param {string[]} categoryIds - Array of category IDs in the desired order
 */
export const saveCategoryOrder = (categoryIds) => {
  try {
    localStorage.setItem(TV_SCREEN_CATEGORY_ORDER_KEY, JSON.stringify(categoryIds));
  } catch (error) {
    console.error('Error saving category order to local storage:', error);
  }
};

/**
 * Clear saved category order from local storage
 */
export const clearCategoryOrder = () => {
  try {
    localStorage.removeItem(TV_SCREEN_CATEGORY_ORDER_KEY);
  } catch (error) {
    console.error('Error clearing category order from local storage:', error);
  }
};

/**
 * Apply custom order to categories array
 * @param {Array} categories - Array of category objects
 * @param {string[]} customOrder - Array of category IDs in desired order
 * @returns {Array} Reordered categories array
 */
export const applyCategoryOrder = (categories, customOrder) => {
  if (!customOrder || customOrder.length === 0) {
    return categories; // Return original order if no custom order set
  }

  // Create a map for quick lookup
  const categoryMap = new Map(categories.map(cat => [cat._id, cat]));
  const orderedCategories = [];
  const remainingCategories = [...categories];

  // Add categories in custom order
  customOrder.forEach(categoryId => {
    const category = categoryMap.get(categoryId);
    if (category) {
      orderedCategories.push(category);
      // Remove from remaining
      const index = remainingCategories.findIndex(cat => cat._id === categoryId);
      if (index > -1) {
        remainingCategories.splice(index, 1);
      }
    }
  });

  // Add any remaining categories that weren't in the custom order
  orderedCategories.push(...remainingCategories);

  return orderedCategories;
};