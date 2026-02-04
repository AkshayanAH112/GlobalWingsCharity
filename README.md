# Global Wings Charity - Student Management System

A comprehensive student management system built with MERN stack and Next.js, designed to manage student details, performance tracking, marks management, and analytics.

## 🚀 Features

- **Student Management**: Add, edit, and manage student profiles
- **Batch Management**: Organize students into batches/classes
- **Marks Management**: Record and track student marks for different subjects
- **Excel Import/Export**: Bulk import students and marks via Excel files
- **Performance Analytics**: Visual charts and graphs for student progress
- **Ranking System**: Automatic batch-wise student ranking
- **Role-Based Access**: Different access levels for Admin, Teachers, and Students
- **Progress Reports**: Comprehensive performance reports with visualizations

## 🛠️ Technology Stack

### Frontend
- Next.js 14+ (App Router)
- React 18+
- TypeScript
- shadcn/ui components
- Tailwind CSS
- Recharts for data visualization
- React Query for data fetching
- React Hook Form + Zod for form validation

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Excel processing with SheetJS

### Deployment
- Frontend: Vercel
- Backend: Railway/Render
- Database: MongoDB Atlas

## 📋 Prerequisites

- Node.js 18+ installed
- MongoDB installed locally or MongoDB Atlas account
- Git installed
- npm or yarn package manager

## 🏗️ Project Structure

```
GlobalWingsCharity/
├── backend/                 # Express.js backend
│   ├── config/             # Configuration files
│   ├── controllers/        # Route controllers
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── utils/             # Utility functions
│   └── server.js          # Entry point
├── frontend/               # Next.js frontend
│   ├── app/               # App router pages
│   ├── components/        # React components
│   ├── lib/               # Utility functions
│   ├── hooks/             # Custom hooks
│   └── types/             # TypeScript types
├── docs/                  # Documentation
└── IMPLEMENTATION_DOCUMENT.md
```

## 🚦 Getting Started

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd GlobalWingsCharity
```

### Step 2: Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure your .env file
npm run dev
```

### Step 3: Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env.local
# Configure your .env.local file
npm run dev
```

## 📝 Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/student-management
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
NODE_ENV=development
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_NAME=Global Wings Charity
```

## 👥 Agent Roles

This project is developed using an agent-based approach:

1. **Frontend Architect**: Designs component structure and architecture
2. **Frontend Developer**: Implements UI components and pages
3. **Backend Architect**: Designs database schema and API structure
4. **Backend Developer**: Implements API endpoints and business logic
5. **Deployment Agent**: Manages deployment and CI/CD

## 📚 Documentation

Refer to the [Implementation Document](./IMPLEMENTATION_DOCUMENT.md) for detailed:
- System architecture
- Database schema
- API endpoints
- Development phases
- Security considerations

## 🔄 Development Workflow

1. Review the Implementation Document
2. Follow the phase-by-phase development approach
3. Each agent works on their designated tasks
4. Regular code reviews and testing
5. Continuous integration and deployment

## 📊 Key Features in Detail

### Student Management
- Manual student entry with form validation
- Bulk import via Excel
- Student profile with detailed information
- Batch assignment

### Marks Management
- Subject-wise marks entry
- Multiple exam types (Midterm, Final, Quiz, Assignment)
- Automatic grade calculation
- Bulk marks import via Excel

### Analytics Dashboard
- Performance trends over time
- Subject-wise analysis
- Batch comparison charts
- Grade distribution visualization

### Ranking System
- Real-time batch-wise ranking
- Percentage and grade-based sorting
- Merit lists generation

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 🚀 Deployment

### Frontend (Vercel)
```bash
cd frontend
vercel deploy
```

### Backend (Railway/Render)
```bash
cd backend
# Follow platform-specific deployment steps
```

## 📄 License

This project is developed for Global Wings Charity educational purposes.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

For any queries or issues, please create an issue in the repository.

---

**Current Status**: Implementation Document Created ✅  
**Next Step**: Repository Setup and Template Integration

**Last Updated**: February 4, 2026
