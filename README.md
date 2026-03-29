# Global Wings Charity - Student Management System

A comprehensive student management system built with MERN stack, designed for administrators and teachers to manage student data, track attendance, record marks, and generate analytics.

## 🎯 System Overview

This is an **admin and teacher-only** system. Students do not have login access. All student data is managed by authorized staff through the dashboard.

### User Roles

- **Admin**: Full system access, manages teachers, students, batches, and subjects
- **Teacher**: Manages assigned students, marks attendance, enters grades, views reports
- **Student**: Records only (no login) - identified by auto-generated Student IDs

## 🚀 Features

- **Student Management**: Add, edit, and manage student profiles with auto-generated IDs
- **Batch Management**: Organize students into class batches with schedules
- **Subject Management**: Create and manage courses/subjects
- **Attendance Tracking**: Daily attendance with status (Present, Absent, Late, Excused)
- **Marks Management**: Record exam results with automatic grade calculation
- **Analytics Dashboard**: Comprehensive reports with grade distribution and performance metrics
- **Role-Based Access**: Admin and teacher-specific permissions
- **Mobile Responsive**: Fully responsive design for all devices

## 🛠️ Technology Stack

### Frontend
- React 18+ with Vite
- TypeScript
- shadcn/ui components
- Tailwind CSS
- TanStack Query (React Query)
- React Router DOM
- Axios for API calls

### Backend
- Node.js with Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs for password hashing
- Express Validator
- Helmet & CORS for security

## 📋 Prerequisites

- Node.js 18+ installed
- MongoDB installed locally or MongoDB Atlas account
- Git installed
```
GlobalWingsCharity/
├── backend/                 # Express.js backend
│   ├── config/             # Configuration files
│   ├── controllers/        # Route controllers
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── scripts/           # Seed scripts
│   │   ├── seedAdmin.js   # Create admin account
│   │   └── seedTeachers.js # Create teacher accounts
│   ├── utils/             # Utility functions
│   └── server.js          # Entry point
├── frontend/               # React with Vite frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   ├── hooks/         # Custom hooks
│   │   └── lib/           # Utility functions & API
├── docs/                  # Documentation
├── ADMIN_SETUP.md        # Admin setup guide
├── QUICKSTART.md         # Quick start guide
└── IMPLEMENTATION_DOCUMENT.md
```

## 🚦 Getting Started

For detailed setup instructions, see [QUICKSTART.md](./QUICKSTART.md)

### Quick Setup

#### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd GlobalWingsCharity
```

#### Step 2: Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI
npm run dev
```

#### Step 3: Create Admin Account
```bash
# In a new terminal
cd backend
npm run seed:admin
```

**Default Admin Credentials:**
- Email: `admin@globalwingcharity.org`
- Username: `admin`
- Password: `Admin@123`

#### Step 4: (Optional) Create Sample Teachers
```bash
npm run seed:teachers
```

#### Step 5: Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

#### Step 6: Access the Application
1. Open browser to `http://localhost:5173`
2. Click "Login"
3. Use admin credentials
4. **Change password immediately!**

## 📝 Environment Variables

### Backend (.env)
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/globalwingcharity
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=7d
NODE_ENV=development
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000/api
```

## 🔐 User Management

### Creating Admin (First Time)
```bash
cd backend
npm run seed:admin
```

### Creating Teachers
```bash
cd backend
npm run seed:teachers
```

Or manually add via MongoDB:
```javascript
// See backend/scripts/seedTeachers.js for example
```

### Adding Students
1. Login as admin or teacher
2. Navigate to **Dashboard → Students**
3. Click **"Add Student"** button
4. Fill in student details
5. Student ID is auto-generated (e.g., GWC20250001)

**Note:** Students do NOT create accounts themselves. All student data is managed by administrators and teachers.

## 📚 Documentation

- [ADMIN_SETUP.md](./ADMIN_SETUP.md) - Complete admin and user management guide
- [QUICKSTART.md](./QUICKSTART.md) - Quick start guide
- [IMPLEMENTATION_DOCUMENT.md](./IMPLEMENTATION_DOCUMENT.md) - Technical documentation

## 📊 Key Features in Detail

### Student Management
- Manual student entry with form validation
- Auto-generated Student IDs (format: GWC20250001)
- Complete student profiles with personal details
- Batch assignment and management
- Mobile-responsive table and card views
- Search and filter functionality

### Batch Management
- Create and manage class batches
- Set batch schedules (days and times)
- Assign teachers to batches
- Track batch capacity (max students)
- Batch status (upcoming, active, completed, cancelled)

### Subject Management
- Create subjects with codes and credits
- Categorize (Core, Elective, Practical, Theory, Project)
- Assign teachers to subjects
- Track total classes per subject
- Active/inactive status management

### Attendance Tracking
- Daily attendance marking
- Multiple status options (Present, Absent, Late, Excused, Holiday)
- Check-in/check-out time tracking
- Real-time attendance statistics
- Date-based filtering and reports
- Visual attendance rate indicators

### Marks Management
- Record exam results by subject
- Multiple exam types (Quiz, Assignment, Mid-Term, Final, Project, Practical)
- Automatic percentage calculation
- Auto-assigned grades (A+ to F)
- Grade distribution visualization
- Subject-wise and student-wise reports

### Analytics Dashboard
- Key performance indicators
- Grade distribution charts
- Student status breakdown
- Attendance rate analytics
- Pass/fail statistics
- Average score calculations
- Time-range based reports

## 🎨 UI/UX Features

- Fully mobile responsive design
- Dark mode support via shadcn/ui
- Loading states and error handling
- Toast notifications for user feedback
- Accessible components (ARIA labels)
- Clean, modern interface with Tailwind CSS
- Consistent color-coded status badges

## 🔐 Security Features

- JWT-based authentication
- Role-based access control (RBAC)
- Protected API routes
- Password hashing with bcryptjs
- No public registration endpoint
- Admin-only user management
- HTTP security headers (Helmet)
- CORS configuration
- Input validation and sanitization

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
