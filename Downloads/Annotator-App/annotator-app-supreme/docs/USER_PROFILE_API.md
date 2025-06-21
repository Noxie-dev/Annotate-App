# User Profile API Documentation

## Overview

This document describes the API endpoints and data structures for the user profile feature in the Annotator-App. All endpoints require authentication unless otherwise specified.

## Authentication

All API requests must include a valid JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Base URL

```
https://api.annotator-app.com/v1
```

## Endpoints

### User Profile Management

#### Get Current User Profile

```http
GET /users/me
```

**Response:**
```json
{
  "id": "user-123",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "avatar": "https://cdn.example.com/avatars/user-123.jpg",
  "role": "Team Member",
  "status": "online",
  "color": "#3b82f6",
  "department": "Engineering",
  "joinDate": "2024-01-15T00:00:00Z",
  "timezone": "America/New_York",
  "phone": "+1 (555) 123-4567",
  "bio": "Software engineer passionate about collaboration tools",
  "isFirstTimeUser": false,
  "lastLoginAt": "2024-01-20T10:00:00Z",
  "createdAt": "2024-01-15T00:00:00Z",
  "updatedAt": "2024-01-20T10:00:00Z",
  "teamAffiliations": [...],
  "preferences": {...}
}
```

#### Get User Profile by ID

```http
GET /users/{userId}
```

**Parameters:**
- `userId` (string, required): The user ID

**Response:** Same as current user profile

#### Update User Profile

```http
PATCH /users/{userId}
```

**Request Body:**
```json
{
  "name": "John Doe",
  "bio": "Updated bio",
  "phone": "+1 (555) 123-4567",
  "department": "Engineering",
  "timezone": "America/New_York"
}
```

**Validation Rules:**
- `name`: 2-50 characters, letters, spaces, hyphens, apostrophes only
- `email`: Valid email format
- `phone`: Valid phone number format (optional)
- `bio`: Maximum 500 characters (optional)
- `department`: Maximum 100 characters (optional)
- `timezone`: Valid IANA timezone identifier

**Response:** Updated user profile object

#### Upload Avatar

```http
POST /users/avatar
```

**Request:** Multipart form data with `avatar` file field

**Validation:**
- File type: image/* only
- File size: Maximum 5MB
- Supported formats: JPEG, PNG, GIF, WebP

**Response:**
```json
{
  "avatarUrl": "https://cdn.example.com/avatars/user-123-1642684800.jpg"
}
```

### User Preferences

#### Update User Preferences

```http
PATCH /users/{userId}/preferences
```

**Request Body:**
```json
{
  "theme": "dark",
  "language": "en",
  "timezone": "America/New_York",
  "notifications": {
    "email": true,
    "push": true,
    "desktop": true,
    "mentions": true,
    "documentUpdates": true,
    "teamMessages": true,
    "voiceCalls": true,
    "quietHours": {
      "enabled": false,
      "startTime": "22:00",
      "endTime": "08:00"
    }
  },
  "annotation": {
    "defaultTool": "highlight",
    "defaultColor": "#fbbf24",
    "strokeWidth": 2,
    "fontSize": 14,
    "autoSave": true,
    "showOtherAnnotations": true,
    "realTimeSync": true,
    "highlightOpacity": 0.3
  },
  "collaboration": {
    "showPresence": true,
    "allowVoiceCalls": true,
    "allowScreenShare": true,
    "autoJoinTeamCalls": false,
    "shareStatus": true,
    "allowDirectMessages": true,
    "showTypingIndicators": true
  },
  "privacy": {
    "profileVisibility": "team",
    "showOnlineStatus": true,
    "allowContactByEmail": true,
    "dataProcessingConsent": true,
    "analyticsOptOut": false,
    "shareUsageData": true
  },
  "accessibility": {
    "highContrast": false,
    "reducedMotion": false,
    "fontSize": "medium",
    "screenReaderOptimized": false,
    "keyboardNavigation": false
  }
}
```

**Response:** Updated user profile with new preferences

### Security Management

#### Change Password

```http
POST /users/change-password
```

**Request Body:**
```json
{
  "currentPassword": "current_password",
  "newPassword": "new_secure_password"
}
```

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

**Response:**
```json
{
  "message": "Password changed successfully"
}
```

#### Enable Two-Factor Authentication

```http
POST /users/mfa/enable
```

**Response:**
```json
{
  "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "backupCodes": [
    "ABC123DEF456",
    "GHI789JKL012",
    "MNO345PQR678",
    "STU901VWX234",
    "YZA567BCD890"
  ]
}
```

#### Disable Two-Factor Authentication

```http
POST /users/mfa/disable
```

**Request Body:**
```json
{
  "code": "123456"
}
```

**Response:**
```json
{
  "message": "Two-factor authentication disabled"
}
```

### Session Management

#### Get User Sessions

```http
GET /users/{userId}/sessions
```

**Response:**
```json
[
  {
    "id": "session-123",
    "userId": "user-123",
    "deviceInfo": {
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)...",
      "ip": "192.168.1.100",
      "location": "San Francisco, CA"
    },
    "createdAt": "2024-01-20T10:00:00Z",
    "lastActiveAt": "2024-01-20T15:30:00Z",
    "expiresAt": "2024-01-27T10:00:00Z"
  }
]
```

#### Revoke Session

```http
DELETE /sessions/{sessionId}
```

**Response:**
```json
{
  "message": "Session revoked successfully"
}
```

## Data Types

### User Object

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  color: string;
  department?: string;
  joinDate?: string;
  timezone?: string;
  phone?: string;
  bio?: string;
  teamAffiliations?: TeamAffiliation[];
  preferences?: UserPreferences;
  isFirstTimeUser?: boolean;
  lastLoginAt?: string;
  createdAt?: string;
  updatedAt?: string;
}
```

### UserPreferences Object

```typescript
interface UserPreferences {
  theme: 'dark' | 'light' | 'system';
  language: string;
  timezone: string;
  notifications: NotificationPreferences;
  annotation: AnnotationPreferences;
  collaboration: CollaborationPreferences;
  privacy: PrivacyPreferences;
  accessibility: AccessibilityPreferences;
}
```

### Error Responses

All error responses follow this format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

### Common Error Codes

- `VALIDATION_ERROR`: Input validation failed
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `RATE_LIMITED`: Too many requests
- `SERVER_ERROR`: Internal server error

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **Profile Updates**: 10 requests per minute
- **Avatar Upload**: 5 requests per hour
- **Password Changes**: 3 requests per hour
- **MFA Operations**: 5 requests per hour
- **General Endpoints**: 100 requests per minute

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642684800
```

## Webhooks

The system can send webhooks for profile-related events:

### Profile Updated

```json
{
  "event": "user.profile.updated",
  "timestamp": "2024-01-20T15:30:00Z",
  "data": {
    "userId": "user-123",
    "changes": ["name", "bio"],
    "updatedBy": "user-123"
  }
}
```

### Security Event

```json
{
  "event": "user.security.password_changed",
  "timestamp": "2024-01-20T15:30:00Z",
  "data": {
    "userId": "user-123",
    "ipAddress": "192.168.1.100",
    "userAgent": "Mozilla/5.0..."
  }
}
```

## SDK Examples

### JavaScript/TypeScript

```typescript
import { UserService } from '@annotator-app/sdk';

const userService = new UserService({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.annotator-app.com/v1'
});

// Update user profile
const updatedUser = await userService.updateProfile('user-123', {
  name: 'John Doe',
  bio: 'Updated bio'
});

// Upload avatar
const avatarUrl = await userService.uploadAvatar(file);

// Update preferences
await userService.updatePreferences('user-123', {
  theme: 'dark',
  notifications: { email: false }
});
```

### cURL Examples

```bash
# Get current user profile
curl -X GET "https://api.annotator-app.com/v1/users/me" \
  -H "Authorization: Bearer <token>"

# Update user profile
curl -X PATCH "https://api.annotator-app.com/v1/users/user-123" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "bio": "Updated bio"}'

# Upload avatar
curl -X POST "https://api.annotator-app.com/v1/users/avatar" \
  -H "Authorization: Bearer <token>" \
  -F "avatar=@/path/to/avatar.jpg"
```

## Testing

### Test Environment

Base URL: `https://api-staging.annotator-app.com/v1`

### Test Data

Use the following test user credentials:

```
Email: test@example.com
Password: TestPassword123!
User ID: test-user-123
```

### Postman Collection

A Postman collection is available for testing all endpoints:
[Download Collection](https://api.annotator-app.com/postman/user-profile-api.json)
