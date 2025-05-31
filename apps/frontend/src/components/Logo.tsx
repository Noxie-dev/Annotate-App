import React from 'react';
import { Link } from 'react-router-dom';
import logoImage from '../assets/file-chat-logo.svg';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
  showText?: boolean;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({
  size = 'md',
  variant = 'light',
  showText = true,
  className = ''
}) => {
  // Logo image sizing - responsive and appropriate for different screen sizes
  const logoSizeClasses = {
    sm: 'logo-sm logo-responsive', // ~80-96px width responsive
    md: 'logo-md logo-responsive', // ~100-128px width responsive
    lg: 'logo-lg logo-responsive'  // ~120-160px width responsive
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  const textColor = variant === 'light' ? 'text-white' : 'text-gray-900';

  return (
    <Link
      to="/"
      className={`flex items-center hover:opacity-80 transition-opacity duration-200 ${className}`}
      aria-label="File Chat - Go to homepage"
    >
      {/* Logo Image */}
      <img
        src={logoImage}
        alt="File Chat Logo"
        className={`${logoSizeClasses[size]} object-contain transition-all duration-300 drop-shadow-sm hover:drop-shadow-md`}
        style={{
          filter: variant === 'dark' ? 'brightness(0.8) contrast(1.1)' : 'none'
        }}
      />
    </Link>
  );
};

export default Logo;
