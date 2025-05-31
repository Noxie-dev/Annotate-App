import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg' 
          : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Logo 
              size="md" 
              variant={isScrolled ? 'dark' : 'light'} 
              showText={true}
              className="transition-all duration-300"
            />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/features"
              className={`font-medium transition-colors duration-200 ${
                isScrolled 
                  ? 'text-gray-700 hover:text-blue-600' 
                  : 'text-white/90 hover:text-white'
              }`}
            >
              Features
            </Link>
            <Link
              to="/pricing"
              className={`font-medium transition-colors duration-200 ${
                isScrolled 
                  ? 'text-gray-700 hover:text-blue-600' 
                  : 'text-white/90 hover:text-white'
              }`}
            >
              Pricing
            </Link>
            <Link
              to="/about"
              className={`font-medium transition-colors duration-200 ${
                isScrolled 
                  ? 'text-gray-700 hover:text-blue-600' 
                  : 'text-white/90 hover:text-white'
              }`}
            >
              About
            </Link>
            <Link
              to="/contact"
              className={`font-medium transition-colors duration-200 ${
                isScrolled 
                  ? 'text-gray-700 hover:text-blue-600' 
                  : 'text-white/90 hover:text-white'
              }`}
            >
              Contact
            </Link>
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/login"
              className={`font-medium transition-colors duration-200 ${
                isScrolled 
                  ? 'text-gray-700 hover:text-blue-600' 
                  : 'text-white/90 hover:text-white'
              }`}
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                isScrolled
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
              }`}
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 rounded-md transition-colors duration-200 ${
                isScrolled 
                  ? 'text-gray-700 hover:text-blue-600' 
                  : 'text-white hover:text-white/80'
              }`}
              aria-label="Toggle mobile menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className={`px-2 pt-2 pb-3 space-y-1 ${
              isScrolled ? 'bg-white' : 'bg-black/20 backdrop-blur-md'
            } rounded-lg mt-2`}>
              <Link
                to="/features"
                className={`block px-3 py-2 rounded-md font-medium transition-colors duration-200 ${
                  isScrolled 
                    ? 'text-gray-700 hover:text-blue-600 hover:bg-gray-50' 
                    : 'text-white hover:text-white/80 hover:bg-white/10'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                to="/pricing"
                className={`block px-3 py-2 rounded-md font-medium transition-colors duration-200 ${
                  isScrolled 
                    ? 'text-gray-700 hover:text-blue-600 hover:bg-gray-50' 
                    : 'text-white hover:text-white/80 hover:bg-white/10'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link
                to="/about"
                className={`block px-3 py-2 rounded-md font-medium transition-colors duration-200 ${
                  isScrolled 
                    ? 'text-gray-700 hover:text-blue-600 hover:bg-gray-50' 
                    : 'text-white hover:text-white/80 hover:bg-white/10'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link
                to="/contact"
                className={`block px-3 py-2 rounded-md font-medium transition-colors duration-200 ${
                  isScrolled 
                    ? 'text-gray-700 hover:text-blue-600 hover:bg-gray-50' 
                    : 'text-white hover:text-white/80 hover:bg-white/10'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact
              </Link>
              <div className="border-t border-gray-200/20 pt-3 mt-3">
                <Link
                  to="/login"
                  className={`block px-3 py-2 rounded-md font-medium transition-colors duration-200 ${
                    isScrolled 
                      ? 'text-gray-700 hover:text-blue-600 hover:bg-gray-50' 
                      : 'text-white hover:text-white/80 hover:bg-white/10'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className={`block px-3 py-2 mt-2 rounded-md font-medium transition-colors duration-200 ${
                    isScrolled
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
