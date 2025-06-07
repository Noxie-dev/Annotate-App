import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import '../styles/LandingPage.css';
import '../styles/theme.css';
import CursorFollower from './CursorFollower';
import DocumentPreview from './DocumentPreview';
import ScrollIndicator from './ScrollIndicator';
import FeatureCard from './FeatureCard';

const LandingPage: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const btnsRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      if (heroRef.current) {
        const heroHeight = heroRef.current.offsetHeight;
        
        if (scrolled < heroHeight) {
          heroRef.current.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  useEffect(() => {
    if (btnsRef.current) {
      const buttons = btnsRef.current.querySelectorAll('.btn');
      
      buttons.forEach(btn => {
        btn.addEventListener('mouseenter', () => {
          const cursorFollower = document.querySelector('.cursor-follower');
          if (cursorFollower) {
            cursorFollower.classList.add('enlarged');
          }
        });
        
        btn.addEventListener('mouseleave', () => {
          const cursorFollower = document.querySelector('.cursor-follower');
          if (cursorFollower) {
            cursorFollower.classList.remove('enlarged');
          }
        });
      });
    }
  }, []);

  const features = [
    {
      icon: '📱',
      title: 'Mobile-First Design',
      description: 'Optimized for smartphones and tablets. Your clients can review and sign documents on any device, anywhere—even in areas with limited connectivity.'
    },
    {
      icon: '🌐',
      title: 'Works Offline',
      description: 'Clients can sign and annotate documents without internet. All changes sync automatically when connection resumes—perfect for rural or underserved areas.'
    },
    {
      icon: '🤝',
      title: 'Real-Time Collaboration',
      description: 'See each other\'s cursors, annotations, and changes in real-time. Live video calling integrated directly above your documents for seamless communication.'
    },
    {
      icon: '🛡️',
      title: 'Enterprise Security',
      description: 'End-to-end encryption, audit logs, and GDPR/POPIA compliance. Your sensitive documents and client communications are always protected.'
    },
    {
      icon: '🧠',
      title: 'AI-Powered Assistance',
      description: 'Built-in AI explains complex clauses, detects missing signatures, and helps translate documents. Making legal and business documents accessible to everyone.'
    },
    {
      icon: '🔧',
      title: 'Easy Integration',
      description: 'Web and mobile SDKs available. Embed File-Chat into your existing CRM, client portal, or legal system with our comprehensive REST APIs.'
    }
  ];

  return (
    <>
      <CursorFollower />
      
      <section className="hero" ref={heroRef}>
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">Collaborative Document Intelligence</h1>
            <p className="hero-subtitle">Talk. Point. Sign. Together.</p>
            <p className="hero-description">
              Bridge the gap between accessibility and action. File-Chat enables real-time document collaboration, 
              annotation, and signing—no matter where you are. Built for professionals and clients who need to get 
              important paperwork done without the barriers of distance or technology.
            </p>
            <div className="cta-buttons" ref={btnsRef}>
              <Link to="/app" className="btn btn-primary">Start Free Trial</Link>
              <a href="#features" className="btn btn-secondary">Watch Demo</a>
            </div>
          </div>
          
          <DocumentPreview />
        </div>
        
        <ScrollIndicator />
      </section>

      <section id="features" className="features">
        <div className="features-header">
          <h2>Why Choose File-Chat?</h2>
          <p>
            Designed for the real world, where professionals and clients need to collaborate on important documents 
            without the friction of traditional processes.
          </p>
        </div>
        
        <div className="features-grid">
          {features.map((feature, index) => (
            <FeatureCard 
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              index={index}
            />
          ))}
        </div>
      </section>
    </>
  );
};

export default LandingPage;

