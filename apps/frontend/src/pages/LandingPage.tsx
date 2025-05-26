import React from 'react';
import { Link } from 'react-router-dom';
import { trackNavigation } from '../utils/analytics';
import HeroSection from '../components/HeroSection';
import FeaturesSection from '../components/FeaturesSection';
import './LandingPage.css';

// Get version from package.json safely
const getVersion = () => {
  try {
    return require('../../package.json').version;
  } catch {
    return '1.0.0';
  }
};

const LandingPage: React.FC = () => {

  return (
    <>
      {/* New Hero Section */}
      <HeroSection />

      <main>
        {/* Features Section */}
        <FeaturesSection />
      </main>

      {/* Footer */}
      <footer role="contentinfo" className="bg-ubuntu-blue-800 text-white py-8 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <p className="text-lg font-medium mb-2">
            File Chat Supreme Edition v{getVersion()}
          </p>
          <p className="text-ubuntu-blue-200">
            © {new Date().getFullYear()} File Chat Team. All rights reserved.
          </p>
          <nav className="mt-4" aria-label="Footer navigation">
            <ul className="flex justify-center space-x-6 text-sm">
              <li>
                <Link
                  to="/privacy"
                  className="text-ubuntu-blue-200 hover:text-white transition-colors"
                  onClick={() => trackNavigation('privacy_policy', '/privacy')}
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-ubuntu-blue-200 hover:text-white transition-colors"
                  onClick={() => trackNavigation('terms_of_service', '/terms')}
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-ubuntu-blue-200 hover:text-white transition-colors"
                  onClick={() => trackNavigation('contact_us', '/contact')}
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </footer>
    </>
  );
};

export default LandingPage;
