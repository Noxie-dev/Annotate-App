import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { trackCTA } from '../utils/analytics';
import DocumentPreview from './DocumentPreview';
import CursorFollower from './CursorFollower';
import BackgroundGrid from './BackgroundGrid';

const HeroSection: React.FC = () => {
  const heroRef = useRef<HTMLElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Responsive detection
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 1024);
    };

    // Parallax scroll effect
    const handleScroll = () => {
      if (heroRef.current) {
        const scrolled = window.pageYOffset;
        const parallax = scrolled * 0.5;
        heroRef.current.style.transform = `translateY(${parallax}px)`;
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <>
      <CursorFollower />
      <section
        ref={heroRef}
        className="hero-section"
        aria-labelledby="hero-title"
      >
        <BackgroundGrid />

        {/* Content Container */}
        <div className="hero-content">
          <div className={`hero-grid ${isMobile ? 'text-center' : 'text-left'}`}>

            {/* Left side - Text content */}
            <div>
              <div>
                <h1 id="hero-title" className="hero-title">
                  Collaborative
                  <br />
                  <span className="gradient-text">
                    Document
                  </span>
                  <br />
                  Intelligence
                </h1>

                <p className="hero-subtitle">
                  Talk. Point. Sign. Together.
                </p>

                <p className="hero-description">
                  Bridge the gap between accessibility and action. File-Chat enables
                  real-time document collaboration, annotation, and signing—no
                  matter where you are. Built for professionals and clients who need to
                  get important paperwork done without the barriers of distance or
                  technology.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className={`hero-buttons ${isMobile ? 'flex-col items-center' : 'justify-start'}`}>
                <Link
                  to="/signup"
                  className="btn-primary"
                  onClick={() => trackCTA('signup_button', 'hero_section')}
                  aria-describedby="signup-description"
                >
                  Start Free Trial
                </Link>

                <Link
                  to="/demo"
                  className="btn-secondary"
                  onClick={() => trackCTA('demo_button', 'hero_section')}
                  aria-describedby="demo-description"
                >
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <span>Watch Demo</span>
                    <span>▶️</span>
                  </span>
                </Link>
              </div>

              {/* Trust indicators */}
              <div className={`trust-indicators ${isMobile ? 'flex-col' : 'justify-start'}`}>
                <div className="trust-indicator">
                  <span style={{ color: '#10b981' }}>🔒</span>
                  <span>SOC 2 Compliant</span>
                </div>
                <div className="trust-indicator">
                  <span style={{ color: '#3b82f6' }}>⚡</span>
                  <span>99.9% Uptime SLA</span>
                </div>
                <div className="trust-indicator">
                  <span style={{ color: '#8b5cf6' }}>🏆</span>
                  <span>Trusted by 10,000+ firms</span>
                </div>
              </div>

              {/* Hidden descriptions for accessibility */}
              <span id="signup-description" className="sr-only">
                Create a new account and start your free trial
              </span>
              <span id="demo-description" className="sr-only">
                View a demonstration of File Chat features and capabilities
              </span>
            </div>

            {/* Right side - Document preview */}
            {!isMobile && (
              <div className="document-preview-container">
                <DocumentPreview />
              </div>
            )}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="scroll-indicator">
          <span className="scroll-indicator-text">Scroll to explore</span>
          <div className="scroll-indicator-icon">
            <div className="scroll-indicator-dot"></div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HeroSection;
