# File Chat: Supreme Edition™

A comprehensive document collaboration platform with AI-powered insights, real-time collaboration, and seamless cross-platform experience.

## 🚀 Features

- **Smart Documents**: AI-powered document analysis and insights
- **Real-time Collaboration**: Work together seamlessly across devices
- **Enterprise Security**: End-to-end encryption and audit trails
- **Cross-Platform**: Web, mobile, and desktop support
- **AI Integration**: OpenAI, Whisper, and translation services
- **Modern Stack**: React, TypeScript, Node.js, PostgreSQL, Redis

## 🏗️ Architecture

### Frontend (Web & PWA)
- **Framework**: React 18 + Vite + TypeScript
- **Styling**: Tailwind CSS with Ubuntu Blue theme
- **Animations**: Framer Motion
- **State Management**: Zustand + React Query
- **PDF Handling**: React-PDF + PDF.js
- **Canvas**: Fabric.js for annotations

### Mobile (Cross-Platform)
- **Framework**: Expo + React Native + TypeScript
- **Audio/Video**: Expo AV
- **Storage**: SQLite/MMKV
- **Real-time**: Socket.IO client

### Backend (API & Services)
- **Runtime**: Node.js 22+ + TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **Real-time**: Socket.IO
- **Security**: Helmet, CORS, Rate Limiting
- **Logging**: Winston
- **AI Services**: OpenAI, Deepgram, Google Translate

## 📁 Project Structure

```
file-chat-supreme/
├── apps/
│   ├── frontend/          # React web application
│   ├── backend/           # Node.js API server
│   └── mobile/            # Expo React Native app
├── packages/
│   ├── shared/            # Shared utilities and types
│   └── ui/                # Shared UI components
├── docs/                  # Documentation
├── docker-compose.yml     # Database services
└── package.json           # Root workspace config
```

## 🛠️ Development Setup

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm 9+
- Docker & Docker Compose
- Git

### Quick Start

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd file-chat-supreme
   npm install
   ```

2. **Start Database Services**
   ```bash
   npm run docker:up
   ```

3. **Install All Dependencies**
   ```bash
   npm run install:all
   ```

4. **Start Development Servers**
   ```bash
   # Frontend (http://localhost:5173)
   npm run dev:frontend
   
   # Backend (http://localhost:3001)
   npm run dev:backend
   
   # Mobile (Expo DevTools)
   npm run dev:mobile
   ```

### Environment Setup

1. **Backend Environment**
   ```bash
   cd apps/backend
   cp .env.example .env
   # Edit .env with your configuration
   ```

2. **Database Setup**
   - PostgreSQL: `localhost:5432`
   - Redis: `localhost:6379`
   - Credentials in `docker-compose.yml`

## 🔧 Available Scripts

### Root Level
- `npm run dev:frontend` - Start frontend dev server
- `npm run dev:backend` - Start backend dev server  
- `npm run dev:mobile` - Start mobile dev server
- `npm run build` - Build frontend and backend
- `npm run docker:up` - Start database services
- `npm run docker:down` - Stop database services

### Frontend (`apps/frontend`)
- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run preview` - Preview production build

### Backend (`apps/backend`)
- `npm run dev` - Development server with hot reload
- `npm run build` - TypeScript compilation
- `npm run start` - Start production server
- `npm run lint` - ESLint check

### Mobile (`apps/mobile`)
- `npm start` - Start Expo development server
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm run web` - Run on web

## 🌐 API Endpoints

### Health Check
- `GET /health` - Service health status

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Current user info

### Documents
- `GET /api/documents` - List documents
- `POST /api/documents` - Create document
- `GET /api/documents/:id` - Get document
- `PUT /api/documents/:id` - Update document
- `DELETE /api/documents/:id` - Delete document

### Chat & AI
- `POST /api/chat/message` - Send chat message
- `GET /api/chat/history/:documentId` - Get chat history
- `POST /api/chat/ai-query` - AI query endpoint

## 🎨 Design System

### Colors (Ubuntu Blue Theme)
- Primary: `#3b82f6` (Ubuntu Blue)
- Secondary: `#E95420` (Ubuntu Orange)
- Accent: `#772953` (Ubuntu Purple)
- Text: `#111111` (Ubuntu Text Grey)
- Background: `#ffffff`

### Typography
- Font Family: Ubuntu, Inter, system-ui
- Responsive scaling with Tailwind CSS

## 🔒 Security Features

- **Rate Limiting**: Configurable per endpoint
- **CORS Protection**: Configured for frontend domains
- **Helmet Security**: Security headers
- **Input Validation**: Joi schema validation
- **Error Handling**: Structured error responses
- **Logging**: Comprehensive request/error logging

## 🚀 Deployment

### Frontend
- **Recommended**: Vercel, Netlify, or Cloudflare Pages
- Build command: `npm run build`
- Output directory: `dist`

### Backend
- **Recommended**: Railway, Render, or Fly.io
- Build command: `npm run build`
- Start command: `npm start`

### Database
- **Production**: Supabase, Neon, or managed PostgreSQL
- **Redis**: Redis Cloud or managed Redis service

## 📚 Documentation

- [API Documentation](./docs/api.md)
- [Frontend Guide](./docs/frontend.md)
- [Mobile Guide](./docs/mobile.md)
- [Deployment Guide](./docs/deployment.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.

## 🆘 Support

- Create an issue for bug reports
- Check existing issues before creating new ones
- Provide detailed reproduction steps

---

**File Chat: Supreme Edition™** - Built with ❤️ using modern web technologies.
