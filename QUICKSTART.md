# Quick Start Guide - Admin Setup

## 🚀 Initial Setup (First Time Only)

### Step 1: Start the Backend
```bash
cd backend
npm run dev
```

### Step 2: Create Admin Account
```bash
# In a new terminal, run:
cd backend
npm run seed:admin
```

**Default Credentials:**
- Email: `admin@globalwingcharity.org`
- Username: `admin`
- Password: `Admin@123`

### Step 3: (Optional) Create Teacher Accounts
```bash
npm run seed:teachers
```

This creates 3 sample teachers:
- Sarah Johnson - `sarah.johnson@globalwingcharity.org` / `Teacher@123`
- Michael Chen - `michael.chen@globalwingcharity.org` / `Teacher@123`
- Emily Davis - `emily.davis@globalwingcharity.org` / `Teacher@123`

### Step 4: Start the Frontend
```bash
cd frontend
npm run dev
```

### Step 5: Login
1. Open browser to `http://localhost:5173`
2. Click "Login" button
3. Use admin credentials
4. Change password immediately!

---

## 📋 Daily Usage

### Adding Students
1. Login as admin/teacher
2. Go to **Dashboard → Students**
3. Click **"Add Student"**
4. Fill in details (Student ID auto-generated)
5. Save

### Managing Data
- **Batches**: Create class groups
- **Subjects**: Add courses/subjects
- **Attendance**: Mark daily attendance
- **Marks**: Record exam results
- **Analytics**: View reports

### No Student Registration!
- Students DO NOT create accounts
- All data managed by admin/teachers
- Students identified by auto-generated ID (e.g., GWC20250001)

---

## 🔧 Available Scripts

### Backend
```bash
npm start          # Production mode
npm run dev        # Development with nodemon
npm run seed:admin # Create admin account
npm run seed:teachers # Create sample teachers
npm run seed:all   # Create both admin & teachers
```

### Frontend
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
```

---

## 🔐 Security Notes

✅ Registration page removed  
✅ Admin-only user creation  
✅ Students have no login access  
✅ JWT authentication enabled  
✅ Role-based authorization  

---

## 📞 Support

Issues? Check [ADMIN_SETUP.md](./ADMIN_SETUP.md) for detailed documentation.
