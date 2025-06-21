# Profile Component Test Suite

This directory contains comprehensive tests for all user profile page components, covering functionality, accessibility, and integration aspects.

## 🧪 Test Files Overview

### Core Component Tests

#### `UserProfile.test.tsx` (25+ tests)

- **Component Rendering**: User data display, loading states, error handling
- **Authentication**: Login state management, session handling
- **User Data Display**: Name, email, avatar, role with edge cases
- **Profile Editing**: Modal interactions, form handling
- **Data Fetching**: API integration, error recovery

#### `NotificationSettings.test.tsx` (19+ tests) ✅ ALL PASSING

- **Component Rendering**: Structured organization (channels vs types)
- **Toggle Functionality**: All notification preferences
- **Settings Persistence**: API integration, error handling
- **Loading States**: Disabled states during updates
- **Accessibility**: ARIA labels, keyboard navigation
- **Dark Mode**: Theme-specific styling

#### `ProfileEditForm.test.tsx` (22+ tests)

- **Form Rendering**: All form fields, user data population
- **Form Interactions**: Input changes, validation
- **Form Validation**: Required fields, email format, phone format
- **Avatar Upload**: File selection, type/size validation, preview
- **Save/Cancel**: Form submission, error handling

#### `ProfileTabs.test.tsx` (45+ tests)

- **Tab Navigation**: All tab sections, state management
- **Annotation Settings**: Tool selection, color picker, sliders
- **Privacy Settings**: Visibility controls, data consent
- **Activity Log**: Recent activity, statistics display
- **Error Handling**: API failures, loading states

#### `PreferencesPanel.test.tsx` (29+ tests)

- **Theme Settings**: Dark/light/system mode selection
- **Annotation Settings**: Tool preferences, color selection
- **Collaboration**: Presence, voice calls, screen sharing
- **Accessibility**: Font size, high contrast, reduced motion
- **Preference Persistence**: Save functionality, error handling

### Specialized Test Suites

#### `ProfileAccessibility.test.tsx` (44+ tests)

- **ARIA Compliance**: Labels, roles, states
- **Keyboard Navigation**: Tab order, focus management
- **Screen Reader**: Alternative text, descriptions
- **Color Contrast**: Dark mode compliance
- **Responsive Design**: Touch targets, mobile accessibility
- **Integration Tests**: API calls, authentication, data consistency

## 🎯 Test Coverage Areas

### ✅ Component Rendering Tests

- Proper rendering with user data
- All sections display correctly  
- Loading and error state handling
- Edge cases (missing data, long text)

### ✅ User Information Display Tests

- User details (name, email, avatar, role)
- Team affiliations and permissions
- Status indicators and presence
- Responsive layout handling

### ✅ Notification Settings Tests

- Email, push, desktop notifications
- Mentions, document updates, team messages
- Structured organization (channels vs types)
- Settings persistence and real-time updates

### ✅ Form Interaction Tests

- Profile editing with comprehensive validation
- Avatar upload with file type/size checks
- Save/cancel functionality with error handling
- Form state management and reset

### ✅ Accessibility Tests

- ARIA labels for all interactive elements
- Keyboard navigation support
- Screen reader compatibility
- Focus management and tab order
- Color contrast compliance

### ✅ Integration Tests

- API calls for CRUD operations
- Authentication state handling
- Error responses and recovery
- Data consistency across components
- Network timeout handling

### ✅ UI/UX Tests

- Dark mode theme implementation
- Responsive design verification
- Animation and transition testing
- Collaboration sidebar consistency

## 🚀 Running Tests

### Individual Test Files

```bash
# Run specific component tests
npm test -- --run src/components/profile/__tests__/NotificationSettings.test.tsx
npm test -- --run src/components/profile/__tests__/UserProfile.test.tsx
npm test -- --run src/components/profile/__tests__/ProfileEditForm.test.tsx
```

### All Profile Tests

```bash
# Run all profile component tests
npm test -- --run src/components/profile/__tests__/

# Run with coverage report
npm test -- --run src/components/profile/__tests__/ --coverage

# Run with verbose output
npm test -- --run src/components/profile/__tests__/ --reporter=verbose
```

### Test Script

```bash
# Use the provided test script for detailed output
./scripts/test-profile-components.sh
```

## 🔧 Test Configuration

### Framework Stack

- **Test Runner**: Vitest
- **Testing Library**: React Testing Library
- **Mocking**: Vitest mocks for stores and hooks
- **TypeScript**: Full type safety in tests

### Mock Strategy

- User store mocking with `createMockUserStore()`
- Authentication hook mocking with `createMockAuth()`
- UI component mocking for isolated testing
- API error simulation for error handling tests

### Test Utilities

- Custom render function with providers
- Mock user data with comprehensive preferences
- File upload simulation utilities
- Accessibility testing helpers

## 📊 Current Status

- **NotificationSettings**: ✅ 19/19 tests passing
- **Total Test Files**: 6 comprehensive suites
- **Total Tests**: 159+ individual test cases
- **TypeScript**: Fully typed following codebase patterns
- **Coverage**: Comprehensive feature coverage

## 🐛 Known Issues & Solutions

### Unhandled Promise Rejections

- **Issue**: API error tests can cause unhandled rejections
- **Solution**: Global rejection handlers in test setup
- **Status**: ✅ Resolved in NotificationSettings tests

### Mock Component Structure

- **Issue**: Complex UI components need proper mocking
- **Solution**: Simplified mocks maintaining essential functionality
- **Status**: ⚠️ Some tests may need mock adjustments

### Form Validation Testing

- **Issue**: Complex form validation requires careful setup
- **Solution**: Comprehensive validation scenarios with proper async handling
- **Status**: 🔄 Ongoing refinement

## 🎯 Next Steps

1. **Fix Remaining Test Issues**: Address mock structure problems
2. **Add Performance Tests**: Component render performance
3. **Expand Edge Cases**: More error scenarios and data variations
4. **Visual Regression**: Screenshot testing for UI consistency
5. **E2E Integration**: Full user workflow testing

## 📝 Contributing

When adding new tests:

1. Follow existing patterns and naming conventions
2. Include proper TypeScript typing
3. Add accessibility tests for new interactive elements
4. Mock external dependencies appropriately
5. Test both success and error scenarios
6. Update this README with new test coverage
