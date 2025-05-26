# File-Chat Landing Page Components

This directory contains the modular components for the File-Chat landing page, implementing the exact design specifications from the provided image.

## Components Overview

### 🎯 HeroSection.tsx
The main hero section component that matches the design from the image:
- **Dark gradient background** with animated grid overlay
- **Split layout** with text content on the left and document preview on the right
- **Responsive design** that adapts to mobile devices
- **Parallax scroll effects** for enhanced user experience
- **Accessibility features** including proper ARIA labels and screen reader support

### 📄 DocumentPreview.tsx
Interactive 3D document preview component:
- **Browser-style window frame** with realistic controls (red, yellow, green dots)
- **3D mouse tracking** that creates perspective transforms on hover
- **Realistic document content** with headers, text lines, and highlighted sections
- **Signature area** with pulsing animation
- **Floating collaboration cursors** showing real-time editing
- **Glow effects** that activate on hover

### 🎨 CursorFollower.tsx
Custom cursor animation system:
- **Smooth following cursor** with lag effect for natural movement
- **Trail cursor** with additional lag for visual depth
- **Blend mode effects** for professional appearance
- **Mobile-responsive** (hidden on mobile devices for performance)

### 🌐 BackgroundGrid.tsx
Animated background grid component:
- **Canvas-based animation** for smooth performance
- **Moving grid pattern** with subtle animation
- **Pulsing dots** at grid intersections
- **Responsive sizing** that adapts to window dimensions
- **Low opacity** to maintain readability

## Design Features

### 🎨 Visual Excellence
- **Professional color palette** using Ubuntu Blue theme
- **Smooth animations** with proper easing functions
- **3D effects** and perspective transforms
- **Gradient backgrounds** matching the design image
- **Typography hierarchy** with proper font weights and sizes

### 📱 Responsive Design
- **Mobile-first approach** with breakpoints for all screen sizes
- **Touch-friendly interactions** on mobile devices
- **Performance optimizations** (cursor effects disabled on mobile)
- **Flexible layouts** using CSS Grid and Flexbox

### ♿ Accessibility
- **ARIA labels** and proper semantic HTML
- **Keyboard navigation** support
- **Screen reader compatibility** with sr-only content
- **Reduced motion support** for users with vestibular disorders
- **High contrast mode** support
- **Focus indicators** for keyboard users

### 🚀 Performance
- **Optimized animations** using requestAnimationFrame
- **Efficient event handling** with proper cleanup
- **Canvas-based graphics** for smooth grid animation
- **Conditional rendering** for mobile optimizations

## Tech Stack
- **React 19** with TypeScript
- **Tailwind CSS** for styling
- **Framer Motion** for advanced animations
- **Canvas API** for background effects
- **CSS Grid & Flexbox** for layouts

## Usage

```tsx
import HeroSection from '../components/HeroSection';

function LandingPage() {
  return (
    <div>
      <HeroSection />
      {/* Other page content */}
    </div>
  );
}
```

## Customization

Each component is designed to be modular and customizable:

- **Colors**: Modify the Tailwind color classes or CSS custom properties
- **Animations**: Adjust timing and easing in the component files
- **Content**: Update text content and links in HeroSection.tsx
- **Layout**: Modify grid layouts and spacing using Tailwind classes

## Browser Support

- **Modern browsers** with ES2020 support
- **Mobile browsers** with touch event support
- **Canvas API** support for background animations
- **CSS Grid** and **Flexbox** support

## Performance Notes

- Animations use `requestAnimationFrame` for 60fps performance
- Canvas animations are optimized for smooth rendering
- Mobile devices have reduced animation complexity
- Proper cleanup prevents memory leaks
