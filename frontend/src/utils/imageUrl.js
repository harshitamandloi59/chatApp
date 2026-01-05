// Utility function to handle image URLs properly
export const getImageUrl = (imagePath) => {
  console.log("🔍 getImageUrl called with:", imagePath, "Type:", typeof imagePath);
  
  // Handle null, undefined, empty string, or whitespace-only strings
  if (!imagePath || imagePath.trim() === '') {
    console.log("✅ Returning null for empty/null image");
    return null;
  }
  
  // If it's already a complete URL (starts with http:// or https://), return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    console.log("✅ Returning external URL:", imagePath);
    return imagePath;
  }
  
  // If it's a relative path, prepend the backend URL
  const fullUrl = `${import.meta.env.VITE_APP_API_URL}${imagePath}`;
  console.log("✅ Returning backend URL:", fullUrl);
  return fullUrl;
};