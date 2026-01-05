// Utility function to handle image URLs properly
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // If it's already a complete URL (starts with http:// or https://), return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If it's a relative path, prepend the backend URL
  return `${import.meta.env.VITE_APP_API_URL}${imagePath}`;
};