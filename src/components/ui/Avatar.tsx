import React from 'react';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: AvatarSize;
  className?: string;
  status?: 'online' | 'offline' | 'busy' | 'away';
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'Avatar',
  name,
  size = 'md',
  className = '',
  status,
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
  };

  const statusClasses = {
    online: 'bg-success-500',
    offline: 'bg-neutral-400',
    busy: 'bg-error-500',
    away: 'bg-warning-500',
  };

  const getInitials = (name: string) => {
    if (!name) return '';
    const nameParts = name.split(' ').filter(Boolean);
    if (nameParts.length === 1) return nameParts[0].substring(0, 2).toUpperCase();
    return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
  };

  // Generate a deterministic background color based on the name
  const getBackgroundColor = (name: string) => {
    if (!name) return 'bg-primary-600';
    const colors = [
      'bg-primary-600',
      'bg-secondary-600',
      'bg-accent-600',
      'bg-success-600',
      'bg-warning-600',
      'bg-error-600',
    ];
    const sum = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[sum % colors.length];
  };

  return (
    <div className={`relative inline-flex ${className}`}>
      {src ? (
        <img
          src={src}
          alt={alt}
          className={`${sizeClasses[size]} rounded-full object-cover`}
        />
      ) : name ? (
        <div
          className={`${
            sizeClasses[size]
          } ${getBackgroundColor(
            name
          )} rounded-full flex items-center justify-center text-white font-medium`}
        >
          {getInitials(name)}
        </div>
      ) : (
        <div
          className={`${sizeClasses[size]} bg-neutral-200 rounded-full flex items-center justify-center text-neutral-500`}
        >
          <svg
            className="w-1/2 h-1/2"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}
      
      {status && (
        <span
          className={`absolute bottom-0 right-0 block rounded-full ring-2 ring-white ${
            statusClasses[status]
          }`}
          style={{
            width: size === 'xs' ? '0.5rem' : size === 'sm' ? '0.75rem' : '1rem',
            height: size === 'xs' ? '0.5rem' : size === 'sm' ? '0.75rem' : '1rem',
          }}
        />
      )}
    </div>
  );
};

export default Avatar;