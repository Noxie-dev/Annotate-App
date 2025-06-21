# File Storage API Documentation

This document outlines the backend API endpoints required for persistent file storage in the Annotator App.

## Overview

The File Storage API provides secure, scalable file management with support for:
- File upload/download with virus scanning
- Hierarchical folder organization
- Access control and sharing
- Search functionality
- Cloud storage integration (S3, Azure, GCP)

## Authentication

All API endpoints require authentication via Bearer token:

```
Authorization: Bearer <jwt_token>
```

## Base URL

```
https://api.annotator-app.com/v1
```

## Endpoints

### File Operations

#### Upload File

```http
POST /api/files/upload
Content-Type: multipart/form-data
```

**Request Body:**
- `file`: File to upload (required)
- `metadata`: JSON string with file metadata (optional)
- `storageType`: Storage backend type (optional)
- `folderId`: Parent folder ID (optional)

**Metadata Schema:**
```json
{
  "title": "Document Title",
  "description": "Document description",
  "tags": ["tag1", "tag2"],
  "isPrivate": true,
  "accessLevel": "private|view|edit|public"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "file_123",
    "name": "document.pdf",
    "url": "https://cdn.example.com/files/file_123.pdf",
    "size": 2048576,
    "type": "application/pdf",
    "createdAt": "2024-01-20T10:30:00Z",
    "metadata": {
      "title": "Document Title",
      "description": "Document description",
      "tags": ["tag1", "tag2"],
      "isPrivate": true,
      "accessLevel": "private",
      "folderId": "folder_456"
    }
  }
}
```

#### Get Files

```http
GET /api/files?page=1&limit=50&folderId=folder_123
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 50, max: 100)
- `folderId`: Filter by folder ID (optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "files": [
      {
        "id": "file_123",
        "name": "document.pdf",
        "url": "https://cdn.example.com/files/file_123.pdf",
        "size": 2048576,
        "type": "application/pdf",
        "createdAt": "2024-01-20T10:30:00Z",
        "metadata": {
          "title": "Document Title",
          "accessLevel": "private",
          "folderId": "folder_456"
        }
      }
    ],
    "folders": [
      {
        "id": "folder_456",
        "name": "Project Documents",
        "parentId": null,
        "createdAt": "2024-01-15T09:00:00Z",
        "itemCount": 12
      }
    ],
    "totalCount": 25,
    "hasMore": true
  }
}
```

#### Delete File

```http
DELETE /api/files/{fileId}
```

**Response:**
```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

#### Get Download URL

```http
GET /api/files/{fileId}/download-url
```

**Response:**
```json
{
  "success": true,
  "data": {
    "downloadUrl": "https://cdn.example.com/files/file_123.pdf?token=xyz&expires=1642680000"
  }
}
```

#### Search Files

```http
GET /api/files/search?q=document&folderId=folder_123
```

**Query Parameters:**
- `q`: Search query (required)
- `folderId`: Limit search to folder (optional)

**Response:** Same as Get Files

### Folder Operations

#### Create Folder

```http
POST /api/folders
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "New Folder",
  "parentId": "folder_123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "folder_789",
    "name": "New Folder",
    "parentId": "folder_123",
    "createdAt": "2024-01-20T10:30:00Z",
    "itemCount": 0
  }
}
```

#### Delete Folder

```http
DELETE /api/folders/{folderId}
```

**Response:**
```json
{
  "success": true,
  "message": "Folder deleted successfully"
}
```

### Sharing Operations

#### Share File

```http
POST /api/files/share
Content-Type: application/json
```

**Request Body:**
```json
{
  "fileId": "file_123",
  "email": "user@example.com",
  "accessLevel": "view|edit",
  "expiresAt": "2024-02-20T10:30:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "File shared successfully"
}
```

### Security Operations

#### Virus Scan

```http
POST /api/files/{fileId}/scan
```

**Response:**
```json
{
  "success": true,
  "data": {
    "clean": true,
    "threats": [],
    "scanId": "scan_123"
  }
}
```

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE",
  "details": {
    "field": "validation error details"
  }
}
```

**Common Error Codes:**
- `UNAUTHORIZED`: Invalid or missing authentication
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Invalid request data
- `FILE_TOO_LARGE`: File exceeds size limit
- `INVALID_FILE_TYPE`: File type not allowed
- `VIRUS_DETECTED`: File contains malware
- `STORAGE_ERROR`: Cloud storage operation failed

## Implementation Requirements

### Backend Infrastructure

1. **Authentication Middleware**
   - JWT token validation
   - User permission checking
   - Rate limiting

2. **File Upload Processing**
   - Multipart form data handling
   - File type validation
   - Size limit enforcement
   - Virus scanning integration

3. **Cloud Storage Integration**
   - AWS S3 / Azure Blob / Google Cloud Storage
   - Signed URL generation for downloads
   - CDN integration for performance

4. **Database Schema**
   ```sql
   -- Files table
   CREATE TABLE files (
     id UUID PRIMARY KEY,
     name VARCHAR(255) NOT NULL,
     original_name VARCHAR(255) NOT NULL,
     size BIGINT NOT NULL,
     type VARCHAR(100) NOT NULL,
     storage_path VARCHAR(500) NOT NULL,
     folder_id UUID REFERENCES folders(id),
     owner_id UUID NOT NULL,
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW(),
     metadata JSONB
   );

   -- Folders table
   CREATE TABLE folders (
     id UUID PRIMARY KEY,
     name VARCHAR(255) NOT NULL,
     parent_id UUID REFERENCES folders(id),
     owner_id UUID NOT NULL,
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );

   -- File shares table
   CREATE TABLE file_shares (
     id UUID PRIMARY KEY,
     file_id UUID REFERENCES files(id),
     shared_with_email VARCHAR(255),
     access_level VARCHAR(20) NOT NULL,
     expires_at TIMESTAMP,
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

5. **Security Features**
   - File type validation
   - Virus scanning (ClamAV integration)
   - Access control enforcement
   - Audit logging
   - CSRF protection

### Environment Configuration

```env
# Storage Configuration
STORAGE_TYPE=s3
STORAGE_BUCKET=annotator-app-files
STORAGE_REGION=us-east-1
STORAGE_ACCESS_KEY=your-access-key
STORAGE_SECRET_KEY=your-secret-key
STORAGE_CDN_URL=https://cdn.example.com

# Security Configuration
VIRUS_SCAN_ENABLED=true
CLAMAV_HOST=localhost
CLAMAV_PORT=3310

# File Limits
MAX_FILE_SIZE=52428800
ALLOWED_FILE_TYPES=application/pdf,image/jpeg,image/png
MAX_FILES_PER_UPLOAD=10

# Database
DATABASE_URL=postgresql://user:pass@localhost/annotator_db
```
