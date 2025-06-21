# The Artisan App - Tech Stack Report

## Overview
The Artisan App is a mobile application built using modern React Native technologies with a focus on cross-platform compatibility (iOS, Android, and Web). The application follows a component-based architecture with a well-organized project structure.

## Core Technologies

### Framework & Platform
- **React Native (v0.79.2)**: Core framework for building the mobile application
- **Expo (v53.0.9)**: Development platform that simplifies React Native development
- **Expo Router (v5.0.6)**: File-based routing system for navigation
- **TypeScript (v5.8.3)**: For type-safe JavaScript development

### UI & Styling
- **NativeWind (v4.1.23)**: Tailwind CSS-like styling for React Native
- **React Native Paper (v5.14.5)**: Material Design component library
- **Expo Vector Icons (v14.1.0)**: Icon library
- **React Native Vector Icons (v10.2.0)**: Additional icon library
- **Expo Blur (v14.1.4)**: For creating blur effects
- **Expo Image (v2.1.7)**: Enhanced image component

### Navigation
- **React Navigation (v7.x)**: Navigation library
  - Native Stack (v7.3.13)
  - Bottom Tabs (v7.3.10)
  - Elements (v2.3.8)

### Animation & Gestures
- **React Native Reanimated (v3.17.4)**: Advanced animations
- **React Native Gesture Handler (v2.24.0)**: Touch handling

### State Management & Data Fetching
- **TanStack React Query (v5.76.1)**: Data fetching and caching
- **Axios (v1.9.0)**: HTTP client for API requests

### Device Features & Integration
- **Expo Haptics (v14.1.4)**: Haptic feedback
- **Expo Linking (v7.1.5)**: Deep linking
- **Expo Web Browser (v14.1.6)**: In-app browser
- **Expo Constants (v17.1.6)**: Access to device constants
- **Expo Status Bar (v2.2.3)**: Status bar management
- **Expo System UI (v5.0.7)**: System UI integration
- **Expo Splash Screen (v0.30.8)**: Splash screen management
- **React Native WebView (v13.13.5)**: Web content embedding

### Development Tools
- **ESLint (v9.27.0)**: Code linting
- **Prettier (v3.5.3)**: Code formatting
- **Babel (v7.25.2)**: JavaScript compiler

## Architecture

### Project Structure
- **app/**: Contains the main application screens and navigation structure
  - **(tabs)/**: Tab-based navigation screens
  - **_layout.tsx**: Root layout configuration
- **components/**: Reusable UI components
  - **ui/**: Platform-specific UI components
- **assets/**: Static assets like images and fonts
- **constants/**: Application constants
- **hooks/**: Custom React hooks

### Navigation Pattern
The application uses Expo Router with a file-based routing system:
- Tab-based navigation for main screens
- Stack navigation for screen transitions
- Custom tab bar with haptic feedback

### Styling Approach
- Uses NativeWind for Tailwind CSS-like styling
- Custom themed components for consistent UI
- Platform-specific components for native look and feel

### State Management
- React Query for server state management
- React's built-in state management (useState, useContext) for local state

## Platform Support
- **iOS**: Full support with platform-specific optimizations
- **Android**: Full support with adaptive icons and edge-to-edge display
- **Web**: Support via Metro bundler with static output

## Development Workflow
- **Start**: `expo start`
- **Platform-specific**: `expo start --ios`, `expo start --android`, `expo start --web`
- **Linting**: `expo lint`
- **Project Reset**: `node ./scripts/reset-project.js`

## Best Practices

### React Native Development Best Practices
1. **Use Functional Components with Hooks**: Prefer functional components with React Hooks (useState, useEffect) over class components for improved readability, testability, and performance
2. **Modular Folder Structure**: Organize code in a modular folder structure (assets/, components/, screens/, navigation/, redux/, services/, utils/) to enhance maintainability and scalability
3. **Leverage TypeScript**: Use TypeScript for static type safety, better IDE support, and fewer runtime errors
4. **Optimize Assets**: Compress and resize images before import; use React Native's Image component for caching to minimize bundle size and improve load times
5. **Limit Third-Party Dependencies**: Reduce bundle bloat and avoid dependency conflicts by carefully vetting libraries before adding them
6. **Consistent Import Ordering**: Enforce consistent import ordering and use module aliasing to improve code clarity

### AI-Assisted Coding Best Practices
1. **Specific Prompts**: Be specific and clear in prompts by defining tone, format, and purpose
2. **Provide Context**: Include project background and existing code snippets for better understanding
3. **Break Down Tasks**: Divide work into smaller units to fit within model context windows
4. **Role-Playing Approach**: Use a multi-step process (review as engineer, specify as PM, pseudocode as tech lead, code as developer)
5. **Iterative Refinement**: Review AI output, provide feedback, and request improvements
6. **Verify Generated Code**: Always test and review AI-generated code to catch potential issues
7. **Follow Team Standards**: Familiarize AI with your team's coding standards and style guides

### Command Execution Best Practices
1. **Use NVM with .nvmrc**: Pin and switch to the correct Node.js LTS version automatically
2. **Commit Lockfiles**: Ensure package-lock.json or yarn.lock are in version control for reproducible installs
3. **Pin Dependency Versions**: Install dependencies with exact version flags to prevent unintended upgrades
4. **Use Dry-Run Flags**: Preview changes before applying them to verify actions
5. **Audit Dependencies**: Regularly check for security vulnerabilities in dependencies
6. **Encapsulate Commands**: Use npm scripts or Makefiles to reduce manual errors and improve developer onboarding

## Conclusion
The Artisan App is built on a modern, well-structured tech stack that leverages the power of React Native and Expo for cross-platform mobile development. The application uses TypeScript for type safety, React Navigation for navigation, and a combination of NativeWind and React Native Paper for styling. The architecture follows best practices with a clear separation of concerns and a component-based approach.

By adhering to the best practices outlined above, the development team can ensure a high-quality, maintainable, and performant application that provides an excellent user experience across all supported platforms.
