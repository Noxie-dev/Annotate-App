import React from 'react';
import '../styles/ScrollIndicator.css';

const ScrollIndicator: React.FC = () => {
  return (
    <div className="scroll-indicator">
      <div className="mouse-icon">
        <div className="mouse-wheel"></div>
      </div>
      <span>Scroll to explore</span>
    </div>
  );
};

export default ScrollIndicator;

