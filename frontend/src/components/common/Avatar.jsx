import React from "react";

const Avatar = ({ 
  src, 
  name = "", 
  size = "w-10 h-10", 
  className = "",
  onClick = null 
}) => {
  console.log("🎭 Avatar component - src:", src, "name:", name, "src type:", typeof src);
  
  const getInitials = (fullName) => {
    if (!fullName) return "U";
    const names = fullName.trim().split(" ");
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  const getGradientColor = (name) => {
    const colors = [
      'from-blue-500 to-purple-600',
      'from-green-500 to-teal-600', 
      'from-pink-500 to-rose-600',
      'from-yellow-500 to-orange-600',
      'from-indigo-500 to-blue-600',
      'from-red-500 to-pink-600',
      'from-cyan-500 to-blue-600',
      'from-emerald-500 to-green-600'
    ];
    
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const handleImageError = (e) => {
    e.target.style.display = 'none';
    e.target.nextSibling.style.display = 'flex';
  };

  return (
    <div 
      className={`${size} rounded-full overflow-hidden relative cursor-pointer flex-shrink-0 ${className}`}
      onClick={onClick}
    >
      {/* Image */}
      {src && src !== 'null' && src !== 'undefined' && (
        <img
          src={src}
          alt={name}
          className="w-full h-full object-cover"
          onError={handleImageError}
        />
      )}
      
      {/* Fallback with initials */}
      <div 
        className={`w-full h-full bg-gradient-to-br ${getGradientColor(name)} flex items-center justify-center text-white font-bold ${
          size.includes('w-20') ? 'text-xl' : 
          size.includes('w-16') ? 'text-lg' : 
          size.includes('w-12') ? 'text-base' : 
          'text-sm'
        }`}
        style={{ display: (src && src !== 'null' && src !== 'undefined') ? 'none' : 'flex' }}
      >
        {getInitials(name)}
      </div>
    </div>
  );
};

export default Avatar;