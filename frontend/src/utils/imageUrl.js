// Base URL for image assets (without /api suffix)
const IMAGE_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

/**
 * Convert relative image path to absolute URL
 * @param {string} imagePath - Relative path like "/uploads/news/filename.jpg" or full URL
 * @returns {string} Absolute URL or empty string
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  
  // If already an absolute URL, return as-is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Convert relative path to absolute URL
  if (imagePath.startsWith('/')) {
    return `${IMAGE_BASE}${imagePath}`;
  }
  
  // If no leading slash, add it
  return `${IMAGE_BASE}/${imagePath}`;
};

/**
 * Process news objects and convert image paths to absolute URLs
 * @param {Object|Array} data - News object or array of news objects
 * @returns {Object|Array} Processed data with absolute image URLs
 */
export const processNewsImages = (data) => {
  if (!data) return data;
  
  if (Array.isArray(data)) {
    return data.map(item => ({
      ...item,
      image: getImageUrl(item.image)
    }));
  }
  
  return {
    ...data,
    image: getImageUrl(data.image)
  };
};
