import React, { useEffect, useRef } from 'react';
import './FeaturesSection.css';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, delay = 0 }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add('animate-in');
            }, delay);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, [delay]);

  return (
    <div
      ref={cardRef}
      className="feature-card-animated bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 opacity-0 translate-y-8 border border-gray-100"
      tabIndex={0}
    >
      <div className="flex justify-start mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3 font-ubuntu">
        {title}
      </h3>
      <p className="text-gray-600 leading-relaxed text-sm">
        {description}
      </p>
    </div>
  );
};

// Icon Components
const MobileIcon = () => (
  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  </div>
);

const OfflineIcon = () => (
  <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  </div>
);

const CollaborationIcon = () => (
  <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  </div>
);

const SecurityIcon = () => (
  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  </div>
);

const AIIcon = () => (
  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  </div>
);

const AnalyticsIcon = () => (
  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  </div>
);

const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: <MobileIcon />,
      title: "Mobile-First Design",
      description: "Optimized for smartphones and tablets. Your clients can review and sign documents on any device, anywhere—even in areas with limited connectivity."
    },
    {
      icon: <OfflineIcon />,
      title: "Works Offline",
      description: "Clients can sign and annotate documents without internet. All changes sync automatically when connection resumes—perfect for rural or underserved areas."
    },
    {
      icon: <CollaborationIcon />,
      title: "Real-Time Collaboration",
      description: "See each other's cursors, annotations, and changes in real-time. Live video calling integrated directly above your documents for seamless communication."
    },
    {
      icon: <SecurityIcon />,
      title: "Enterprise Security",
      description: "End-to-end encryption, audit logs, and GDPR/POPIA compliance. Your sensitive documents and client communications are always protected."
    },
    {
      icon: <AIIcon />,
      title: "AI-Powered Insights",
      description: "Smart document analysis and automated suggestions help streamline your workflow and catch important details before they become issues."
    },
    {
      icon: <AnalyticsIcon />,
      title: "Advanced Analytics",
      description: "Track document engagement, completion rates, and collaboration patterns to optimize your processes and improve client experience."
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50" aria-labelledby="features-title">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 id="features-title" className="text-4xl font-bold text-gray-900 mb-4 font-ubuntu">
            Powerful Features for Modern Collaboration
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to streamline document workflows and enhance client collaboration
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={index * 100}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
